// Supabase Edge Function: Scrape Fishing Reports
// Dynamically finds local fly shops and scrapes their fishing reports
// Caches reports for 3 days and remembers which shops work for which waters
// Deploy with: supabase functions deploy scrape-fishing-report

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_DURATION_DAYS = 3;
const MAX_REPORT_AGE_DAYS = 14; // Reports older than 2 weeks are considered stale

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { water_body_id, water_body_name, force_refresh = false } = await req.json();

    if (!water_body_id && !water_body_name) {
      throw new Error('water_body_id or water_body_name is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get water body details
    let waterBodyName = water_body_name;
    let waterBodyState = '';
    let waterBodyCity = '';

    if (water_body_id) {
      const { data: waterBody } = await supabase
        .from('water_bodies')
        .select('name, state, city')
        .eq('id', water_body_id)
        .single();

      if (waterBody) {
        waterBodyName = waterBody.name;
        waterBodyState = waterBody.state;
        waterBodyCity = waterBody.city || '';
      }
    }

    // Check for cached report (not expired)
    if (!force_refresh) {
      const { data: cachedReport } = await supabase
        .from('fishing_reports')
        .select('*')
        .or(`water_body_id.eq.${water_body_id},water_body_name.ilike.%${waterBodyName}%`)
        .gt('expires_at', new Date().toISOString())
        .order('scraped_at', { ascending: false })
        .limit(1)
        .single();

      if (cachedReport) {
        console.log('Returning cached report for:', waterBodyName);
        return new Response(
          JSON.stringify({
            report: cachedReport,
            from_cache: true,
            cache_expires: cachedReport.expires_at,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get ALL shops that cover this water body
    const { data: knownSources } = await supabase
      .from('fly_shop_sources')
      .select('*')
      .eq('is_active', true)
      .contains('waters_covered', [waterBodyName]);

    let shopsToScrape = knownSources || [];

    // If no known sources, try to discover some
    if (shopsToScrape.length === 0 && claudeApiKey) {
      console.log('No known sources, searching for fly shops near:', waterBodyName, waterBodyState);

      const discoveredShop = await discoverFlyShop(
        waterBodyName,
        waterBodyState,
        waterBodyCity,
        claudeApiKey
      );

      if (discoveredShop) {
        const { data: newSource } = await supabase
          .from('fly_shop_sources')
          .insert({
            name: discoveredShop.name,
            website: discoveredShop.website,
            reports_url: discoveredShop.reports_url,
            state: waterBodyState,
            waters_covered: [waterBodyName],
            is_active: true,
          })
          .select()
          .single();

        if (newSource) {
          shopsToScrape = [newSource];
        }
      }
    }

    if (shopsToScrape.length === 0) {
      return new Response(
        JSON.stringify({
          report: null,
          message: 'Could not find any fly shops with fishing reports for this water',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scrape from ALL shops and collect reports
    console.log(`Scraping from ${shopsToScrape.length} shop(s) for ${waterBodyName}`);
    const allReports: Array<{
      source: string;
      url: string;
      text: string;
      reportDate: Date | null;
      flies: string[];
      conditions: Record<string, any>;
      effectiveness: string;
    }> = [];

    for (const shop of shopsToScrape) {
      try {
        console.log('Scraping from:', shop.name, shop.reports_url);
        const reportData = await scrapeReport(shop, waterBodyName);

        if (!reportData || !reportData.text) {
          console.log('No content from:', shop.name);
          // Track failed scrape - mark shop inactive after 3 consecutive failures
          await trackFailedScrape(supabase, shop.id);
          continue;
        }

        // Extract data using Claude
        let extractedData = {
          flies: [] as string[],
          conditions: {} as Record<string, any>,
          effectiveness: '',
          reportDate: null as string | null,
        };

        if (claudeApiKey) {
          extractedData = await extractReportDataWithDate(reportData.text, waterBodyName, claudeApiKey);
        }

        // Check if report is recent (within MAX_REPORT_AGE_DAYS)
        const reportDate = extractedData.reportDate ? parseReportDate(extractedData.reportDate) : null;
        if (reportDate) {
          const daysSinceReport = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceReport > MAX_REPORT_AGE_DAYS) {
            console.log(`Report from ${shop.name} is ${Math.round(daysSinceReport)} days old, skipping`);
            continue;
          }
        }

        // Check if we got useful data
        const hasUsefulData = extractedData.flies.length > 0 ||
          Object.keys(extractedData.conditions).length > 0 ||
          (extractedData.effectiveness && !extractedData.effectiveness.includes('No fishing report found'));

        if (hasUsefulData) {
          allReports.push({
            source: shop.name,
            url: shop.reports_url,
            text: reportData.text,
            reportDate,
            flies: extractedData.flies,
            conditions: extractedData.conditions,
            effectiveness: extractedData.effectiveness,
          });
          // Track successful scrape
          await trackSuccessfulScrape(supabase, shop.id);
        } else {
          // No useful data extracted - might be generic content
          console.log(`No useful data extracted from ${shop.name}`);
          await trackFailedScrape(supabase, shop.id);
        }
      } catch (error) {
        console.error(`Error scraping ${shop.name}:`, error);
        await trackFailedScrape(supabase, shop.id);
      }
    }

    if (allReports.length === 0) {
      return new Response(
        JSON.stringify({
          report: null,
          message: 'No current fishing reports available (reports may be outdated)',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create aggregated summary from all reports
    let aggregatedReport;
    if (allReports.length === 1) {
      // Single source - use as is
      const r = allReports[0];
      aggregatedReport = {
        source_name: r.source,
        sources: [{ name: r.source, url: r.url }],
        extracted_flies: r.flies,
        extracted_conditions: r.conditions,
        effectiveness_notes: r.effectiveness,
      };
    } else {
      // Multiple sources - aggregate with Claude
      aggregatedReport = claudeApiKey
        ? await aggregateReports(allReports, waterBodyName, claudeApiKey)
        : {
            source_name: `${allReports.length} fly shops`,
            sources: allReports.map(r => ({ name: r.source, url: r.url })),
            extracted_flies: [...new Set(allReports.flatMap(r => r.flies))],
            extracted_conditions: allReports[0].conditions,
            effectiveness_notes: allReports.map(r => r.effectiveness).join(' '),
          };
    }

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_DURATION_DAYS);

    // Cache the aggregated report
    const { data: newReport, error: insertError } = await supabase
      .from('fishing_reports')
      .insert({
        water_body_id: water_body_id || null,
        water_body_name: waterBodyName,
        source_name: aggregatedReport.source_name,
        source_url: aggregatedReport.sources[0]?.url || '',
        report_date: allReports[0]?.reportDate?.toISOString().split('T')[0] || null,
        report_text: JSON.stringify(aggregatedReport.sources),
        extracted_flies: aggregatedReport.extracted_flies,
        extracted_conditions: aggregatedReport.extracted_conditions,
        effectiveness_notes: aggregatedReport.effectiveness_notes,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error caching report:', insertError);
    }

    return new Response(
      JSON.stringify({
        report: newReport || {
          water_body_name: waterBodyName,
          source_name: aggregatedReport.source_name,
          sources: aggregatedReport.sources,
          extracted_flies: aggregatedReport.extracted_flies,
          extracted_conditions: aggregatedReport.extracted_conditions,
          effectiveness_notes: aggregatedReport.effectiveness_notes,
          expires_at: expiresAt.toISOString(),
        },
        from_cache: false,
        sources_count: allReports.length,
        cache_expires: expiresAt.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Use Claude to discover fly shops near the water body
async function discoverFlyShop(
  waterBodyName: string,
  state: string,
  city: string,
  apiKey: string
): Promise<{ name: string; website: string; reports_url: string } | null> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Find the most reputable local fly fishing shop that posts fishing reports for ${waterBodyName} in ${state}${city ? `, near ${city}` : ''}.

I need a fly shop that:
1. Is located near this water body
2. Posts regular fishing reports on their website
3. Is well-known in the local fly fishing community

Return ONLY a JSON object with:
- name: the shop name
- website: their main website URL (e.g., https://example.com)
- reports_url: the specific URL to their fishing reports page

IMPORTANT: For the reports_url, use common patterns like:
- /fishing-reports
- /reports
- /fishing-report
- /blog (if they post reports on their blog)

If you're not confident about a specific shop, return null.

Example response:
{"name": "Blue Ribbon Flies", "website": "https://blueribbonflies.com", "reports_url": "https://blueribbonflies.com/fishing-reports"}

Return ONLY the JSON, no other text.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Claude API error discovering shop');
      return null;
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    if (text === 'null' || text.toLowerCase().includes('null')) {
      return null;
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.name && parsed.website && parsed.reports_url) {
        console.log('Claude discovered shop:', parsed.name, parsed.reports_url);

        // Try the suggested URL first
        const isValid = await validateUrl(parsed.reports_url);
        if (isValid) {
          console.log('Suggested URL is valid');
          return parsed;
        }

        // Try common fishing report URL patterns
        const baseUrl = parsed.website.replace(/\/$/, '');
        const urlPatterns = [
          '/fishing-reports',
          '/fishing-report',
          '/reports',
          '/blog',
          '/pages/fishing-reports',
          '/pages/fishing-report',
        ];

        for (const pattern of urlPatterns) {
          const testUrl = baseUrl + pattern;
          console.log('Trying pattern:', testUrl);
          const patternValid = await validateUrl(testUrl);
          if (patternValid) {
            console.log('Found working URL pattern:', testUrl);
            return { ...parsed, reports_url: testUrl };
          }
        }

        // If no pattern works, try the main website (might have reports on homepage)
        const mainValid = await validateUrl(parsed.website);
        if (mainValid) {
          console.log('Using main website as fallback:', parsed.website);
          return { ...parsed, reports_url: parsed.website };
        }

        console.log('No valid URL found for shop:', parsed.name);
      }
    }

    return null;
  } catch (error) {
    console.error('Error discovering fly shop:', error);
    return null;
  }
}

// Validate that a URL returns a successful response
async function validateUrl(url: string): Promise<boolean> {
  try {
    console.log('Validating URL:', url);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Accept 200, 301, 302 as valid (redirects are fine)
    const isValid = response.status >= 200 && response.status < 400;
    console.log('URL validation result:', url, response.status, isValid);
    return isValid;
  } catch (error) {
    console.log('URL validation error:', url, error);
    return false;
  }
}

async function scrapeReport(
  source: any,
  waterBodyName: string
): Promise<{ text: string; date: string | null } | null> {
  try {
    const response = await fetch(source.reports_url, {
      headers: {
        'User-Agent': 'HatchMatch Fishing App/1.0 (contact@hatchmatch.app)',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch:', response.status);
      return null;
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (!doc) {
      console.error('Failed to parse HTML');
      return null;
    }

    let reportText = '';
    let reportDate: string | null = null;

    // Strategy 1: Check if this is a blog listing page (has multiple post links)
    // If so, try to fetch the first/most recent post
    // Broader selector to catch Shopify blogs and various CMS patterns
    const postLinks = doc.querySelectorAll(
      'a[href*="fishing-report"], a[href*="report"], a[href*="conditions"], ' +
      'article a, .post-title a, .article-title a, .blog-post a, ' +
      '.card a, .blog-card a, h2 a, h3 a, h4 a, ' +
      '.grid a, .collection a, .article-link'
    );
    const baseUrl = new URL(source.reports_url).origin;
    console.log(`Found ${postLinks.length} potential links on page`);

    // Collect and score potential report links
    const scoredLinks: Array<{ href: string; score: number; text: string }> = [];

    for (const link of postLinks) {
      const href = link.getAttribute('href');
      const linkText = (link.textContent || '').toLowerCase();

      if (!href || href === source.reports_url) continue;

      let score = 0;

      // Strong indicators of actual fishing reports (not fly patterns/gear)
      if (linkText.includes('fishing report')) score += 15;
      if (linkText.includes('conditions') && linkText.includes('report')) score += 15;
      if (linkText.includes('river report')) score += 10;
      if (linkText.includes('conditions')) score += 5;
      if (/january|february|march|april|may|june|july|august|september|october|november|december/i.test(linkText)) score += 10;
      if (/20\d{2}/.test(linkText)) score += 8; // Year in text
      if (/\d{1,2}\/\d{1,2}/.test(linkText)) score += 8; // Date format
      if (/\d{1,2}(st|nd|rd|th)/i.test(linkText)) score += 8; // Date ordinals like "28th"

      // Negative indicators (fly patterns, gear, etc.)
      if (linkText.includes('fly pattern') || linkText.includes('fly tying')) score -= 15;
      if (linkText.includes('gear') || linkText.includes('equipment')) score -= 10;
      if (linkText.includes('streamer') && !linkText.includes('report')) score -= 5;
      if (linkText.includes('nymph') && !linkText.includes('report')) score -= 5;
      if (linkText.includes('product') || linkText.includes('shop')) score -= 10;

      // URL patterns
      if (href.includes('fishing-report') || href.includes('river-report')) score += 5;
      if (href.includes('/gear/') || href.includes('/products/')) score -= 10;

      if (score > 0) {
        scoredLinks.push({ href, score, text: linkText });
      }
    }

    // Sort by score and try the best matches first
    scoredLinks.sort((a, b) => b.score - a.score);
    console.log('Scored links:', scoredLinks.slice(0, 5));

    for (const { href, score, text } of scoredLinks.slice(0, 3)) { // Try top 3
      if (score >= 5) { // Minimum score threshold
          // Fetch this individual post
          const postUrl = href.startsWith('http') ? href : baseUrl + href;
          console.log('Found potential report post:', postUrl);

          try {
            const postResponse = await fetch(postUrl, {
              headers: {
                'User-Agent': 'HatchMatch Fishing App/1.0 (contact@hatchmatch.app)',
              },
            });

            if (postResponse.ok) {
              const postHtml = await postResponse.text();
              const postDoc = new DOMParser().parseFromString(postHtml, 'text/html');

              if (postDoc) {
                // Extract content from the individual post
                const contentSelectors = [
                  'article .content',
                  'article',
                  '.post-content',
                  '.entry-content',
                  '.blog-post-content',
                  '.rte', // Shopify rich text
                  'main',
                ];

                for (const selector of contentSelectors) {
                  const element = postDoc.querySelector(selector);
                  if (element) {
                    const text = element.textContent || '';
                    if (text.length > 300) {
                      reportText = text;
                      break;
                    }
                  }
                }

                // Try to find date on post page
                const postDateSelectors = ['.date', '.post-date', 'time', '.published', '.blog-date', 'meta[property="article:published_time"]'];
                for (const selector of postDateSelectors) {
                  const dateEl = postDoc.querySelector(selector);
                  if (dateEl) {
                    const dateText = dateEl.textContent || dateEl.getAttribute('datetime') || dateEl.getAttribute('content');
                    if (dateText) {
                      reportDate = dateText.trim();
                      break;
                    }
                  }
                }

                if (reportText.length > 300) {
                  console.log('Got content from individual post');
                  break;
                }
              }
            }
          } catch (e) {
            console.log('Error fetching individual post:', e);
          }
      }
    }

    // Strategy 2: If no post content found, look for article/report content on the page
    if (reportText.length < 300) {
      const articleSelectors = [
        'article',
        '.fishing-report',
        '.report-content',
        '.post-content',
        '.entry-content',
        '.page-content',
        '.rte',
        'main',
        '.content',
      ];

      for (const selector of articleSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          reportText = element.textContent || '';
          if (reportText.length > 300) break;
        }
      }
    }

    // Strategy 3: If still no content, get body text as last resort
    if (reportText.length < 300) {
      reportText = doc.body?.textContent || '';
    }

    // Clean up the text
    reportText = reportText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
      .slice(0, 5000);

    // Try to find date if not found from individual post
    if (!reportDate) {
      const dateSelectors = ['.date', '.post-date', 'time', '.published'];
      for (const selector of dateSelectors) {
        const dateEl = doc.querySelector(selector);
        if (dateEl) {
          const dateText = dateEl.textContent || dateEl.getAttribute('datetime');
          if (dateText) {
            reportDate = dateText.trim();
            break;
          }
        }
      }
    }

    return { text: reportText, date: reportDate };

  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
}

// Parse various date formats from report text
function parseReportDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  try {
    // Try direct parsing
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;

    // Try common formats like "January 15, 2026" or "Jan 15, 2026"
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
      'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    const lowerDate = dateStr.toLowerCase();
    for (let i = 0; i < monthNames.length; i++) {
      if (lowerDate.includes(monthNames[i])) {
        const monthNum = i % 12;
        const dayMatch = dateStr.match(/(\d{1,2})/);
        const yearMatch = dateStr.match(/(\d{4})/);
        if (dayMatch && yearMatch) {
          return new Date(parseInt(yearMatch[1]), monthNum, parseInt(dayMatch[1]));
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Aggregate multiple reports into a summary
async function aggregateReports(
  reports: Array<{
    source: string;
    url: string;
    flies: string[];
    conditions: Record<string, any>;
    effectiveness: string;
  }>,
  waterBodyName: string,
  apiKey: string
): Promise<{
  source_name: string;
  sources: Array<{ name: string; url: string }>;
  extracted_flies: string[];
  extracted_conditions: Record<string, any>;
  effectiveness_notes: string;
}> {
  try {
    const sourceSummaries = reports.map(r =>
      `${r.source}: ${r.effectiveness} Flies: ${r.flies.join(', ')}`
    ).join('\n\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Summarize these ${reports.length} fishing reports for ${waterBodyName} into a single cohesive summary:

${sourceSummaries}

Return a JSON object with:
- effectiveness: A 2-3 sentence summary combining the key insights from all reports
- top_flies: Array of the most recommended flies across all reports (max 8)

Return ONLY JSON.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to aggregate reports');
    }

    const data = await response.json();
    const text = data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        source_name: `${reports.length} fly shops`,
        sources: reports.map(r => ({ name: r.source, url: r.url })),
        extracted_flies: parsed.top_flies || [...new Set(reports.flatMap(r => r.flies))].slice(0, 8),
        extracted_conditions: reports[0].conditions, // Use most recent conditions
        effectiveness_notes: parsed.effectiveness || reports.map(r => r.effectiveness).join(' '),
      };
    }
  } catch (error) {
    console.error('Error aggregating reports:', error);
  }

  // Fallback: simple aggregation
  return {
    source_name: `${reports.length} fly shops`,
    sources: reports.map(r => ({ name: r.source, url: r.url })),
    extracted_flies: [...new Set(reports.flatMap(r => r.flies))].slice(0, 8),
    extracted_conditions: reports[0].conditions,
    effectiveness_notes: reports.map(r => r.effectiveness).join(' '),
  };
}

async function extractReportDataWithDate(
  reportText: string,
  waterBodyName: string,
  apiKey: string
): Promise<{
  flies: string[];
  conditions: Record<string, any>;
  effectiveness: string;
  reportDate: string | null;
}> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Extract a CURRENT fishing report from this fly shop website content for ${waterBodyName}.

CRITICAL REQUIREMENTS:
1. You MUST find a SPECIFIC DATE (like "January 28, 2026" or "1/28/26" or "Updated Jan 28")
2. The report MUST describe CURRENT conditions, not general seasonal advice
3. Look for language like "this week", "currently", "right now", "today", "recent conditions"
4. REJECT generic/evergreen content that applies year-round (like "various hatches throughout the year")

TEXT FROM WEBSITE:
${reportText.slice(0, 3000)}

Return a JSON object with:
- reportDate: The SPECIFIC date found (e.g., "January 28, 2026") - REQUIRED, return null if no date found
- flies: Array of SPECIFIC fly patterns currently working (not general recommendations)
- conditions: Object with water_temp, water_clarity, water_level if CURRENT values mentioned
- effectiveness: 1-2 sentence summary of CURRENT conditions (what's happening NOW, not what generally works)
- isCurrentReport: true if this appears to be a recent dated report, false if it's generic seasonal info

IMPORTANT: If the content is just general seasonal advice without a specific date and current conditions, return:
{"reportDate": null, "flies": [], "conditions": {}, "effectiveness": "No current fishing report found - only general information available.", "isCurrentReport": false}

Return ONLY valid JSON, no other text.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Claude API error');
      return { flies: [], conditions: {}, effectiveness: '', reportDate: null };
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // If not a current report (generic seasonal info), treat as no report
      if (parsed.isCurrentReport === false || !parsed.reportDate) {
        console.log('Content is generic/seasonal info, not a current report');
        return { flies: [], conditions: {}, effectiveness: '', reportDate: null };
      }

      return {
        flies: parsed.flies || [],
        conditions: parsed.conditions || {},
        effectiveness: parsed.effectiveness || '',
        reportDate: parsed.reportDate || null,
      };
    }

    return { flies: [], conditions: {}, effectiveness: '', reportDate: null };

  } catch (error) {
    console.error('Extract error:', error);
    return { flies: [], conditions: {}, effectiveness: '', reportDate: null };
  }
}

// Track successful scrape - reset failure count and update timestamp
async function trackSuccessfulScrape(supabase: any, shopId: string): Promise<void> {
  try {
    await supabase
      .from('fly_shop_sources')
      .update({
        last_successful_scrape: new Date().toISOString(),
        consecutive_failures: 0,
        is_active: true, // Re-activate if it was deactivated
      })
      .eq('id', shopId);
  } catch (error) {
    console.error('Error tracking successful scrape:', error);
  }
}

// Track failed scrape - increment failure count and deactivate after 3 failures
async function trackFailedScrape(supabase: any, shopId: string): Promise<void> {
  try {
    // Get current failure count
    const { data: shop } = await supabase
      .from('fly_shop_sources')
      .select('consecutive_failures')
      .eq('id', shopId)
      .single();

    const currentFailures = shop?.consecutive_failures || 0;
    const newFailures = currentFailures + 1;

    // Deactivate shop after 3 consecutive failures
    const shouldDeactivate = newFailures >= 3;

    await supabase
      .from('fly_shop_sources')
      .update({
        consecutive_failures: newFailures,
        is_active: !shouldDeactivate,
      })
      .eq('id', shopId);

    if (shouldDeactivate) {
      console.log(`Shop ${shopId} deactivated after ${newFailures} consecutive failures`);
    }
  } catch (error) {
    console.error('Error tracking failed scrape:', error);
  }
}
