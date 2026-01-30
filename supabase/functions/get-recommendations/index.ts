// Supabase Edge Function: Get Fly Recommendations
// This function calls Claude API to generate fly recommendations
// Deploy with: supabase functions deploy get-recommendations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaterBody {
  id: string;
  name: string;
  type: string;
  state: string;
  city: string | null;
  species: string[];
  description: string | null;
}

interface FlyRecommendation {
  fly_id: string;
  fly_name: string;
  fly_type: string;
  confidence: number;
  reasoning: string;
  size: string;
  technique: string;
  image_url?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { water_body_id } = await req.json();

    if (!water_body_id) {
      throw new Error('water_body_id is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch water body details
    const { data: waterBody, error: waterError } = await supabase
      .from('water_bodies')
      .select('*')
      .eq('id', water_body_id)
      .single();

    if (waterError || !waterBody) {
      throw new Error('Water body not found');
    }

    // Fetch available flies from database
    const { data: flies } = await supabase
      .from('flies')
      .select('id, name, type, sizes, description, species_targets');

    // Fetch hatch chart data for the region/month
    const currentMonth = new Date().getMonth() + 1;
    const { data: hatchData } = await supabase
      .from('hatch_charts')
      .select('*')
      .eq('month', currentMonth)
      .ilike('region', `%${waterBody.state}%`);

    // Fetch recent catch reports for this water body (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: catchReports } = await supabase
      .from('catch_reports')
      .select(`
        fly_id,
        effectiveness,
        caught_at,
        conditions,
        notes,
        flies (name, type)
      `)
      .eq('water_body_id', water_body_id)
      .eq('is_public', true)
      .gte('caught_at', thirtyDaysAgo.toISOString())
      .order('caught_at', { ascending: false })
      .limit(50);

    // Aggregate catch report data
    const catchReportSummary = aggregateCatchReports(catchReports || []);

    // Fetch cached fishing reports from fly shops (valid for 3 days)
    const { data: fishingReports } = await supabase
      .from('fishing_reports')
      .select('*')
      .or(`water_body_id.eq.${water_body_id},water_body_name.ilike.%${waterBody.name}%`)
      .gt('expires_at', new Date().toISOString())
      .order('scraped_at', { ascending: false })
      .limit(3);

    // If no cached reports, try to scrape (call the scrape function)
    let fishingReportData = fishingReports || [];
    if (fishingReportData.length === 0) {
      try {
        const scrapeResponse = await fetch(`${supabaseUrl}/functions/v1/scrape-fishing-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            water_body_id,
            water_body_name: waterBody.name,
          }),
        });

        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          if (scrapeData.report) {
            fishingReportData = [scrapeData.report];
          }
        }
      } catch (scrapeError) {
        console.log('Could not fetch fishing report:', scrapeError);
        // Continue without fishing report - not critical
      }
    }

    // Get current weather (mock for now - would integrate weather API)
    const weather = await getWeatherData(waterBody.latitude, waterBody.longitude);

    // Build the prompt for Claude
    const prompt = buildPrompt(waterBody, flies || [], hatchData || [], weather, catchReportSummary, fishingReportData);

    // Call Claude API
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!claudeApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      throw new Error('Failed to get recommendations from AI');
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content[0].text;

    // Parse the JSON response from Claude
    const recommendations = parseClaudeResponse(responseText, flies || []);

    // Format fishing report for response
    const fishingReport = fishingReportData.length > 0 ? {
      source_name: fishingReportData[0].source_name,
      report_date: fishingReportData[0].scraped_at,
      effectiveness_notes: fishingReportData[0].effectiveness_notes,
      extracted_flies: fishingReportData[0].extracted_flies || [],
      conditions: fishingReportData[0].extracted_conditions || {},
    } : null;

    return new Response(
      JSON.stringify({
        recommendations,
        conditions_summary: `Based on ${weather.conditions} conditions with ${weather.temperature}°F air temp.`,
        water_body: waterBody.name,
        fishing_report: fishingReport,
        generated_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
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

interface CatchReportSummary {
  totalReports: number;
  topFlies: Array<{
    flyName: string;
    flyType: string;
    reportCount: number;
    avgEffectiveness: number;
  }>;
  recentConditions: string[];
  recentNotes: string[];
}

function aggregateCatchReports(reports: any[]): CatchReportSummary {
  if (!reports || reports.length === 0) {
    return {
      totalReports: 0,
      topFlies: [],
      recentConditions: [],
      recentNotes: [],
    };
  }

  // Group reports by fly
  const flyStats: Record<string, { count: number; totalEffectiveness: number; flyType: string }> = {};

  const conditions: string[] = [];
  const notes: string[] = [];

  for (const report of reports) {
    const flyName = report.flies?.name;
    const flyType = report.flies?.type;

    if (flyName) {
      if (!flyStats[flyName]) {
        flyStats[flyName] = { count: 0, totalEffectiveness: 0, flyType: flyType || 'unknown' };
      }
      flyStats[flyName].count++;
      if (report.effectiveness) {
        flyStats[flyName].totalEffectiveness += report.effectiveness;
      }
    }

    // Collect recent conditions
    if (report.conditions) {
      const condStr = formatConditions(report.conditions);
      if (condStr && !conditions.includes(condStr)) {
        conditions.push(condStr);
      }
    }

    // Collect useful notes (non-empty, max 5)
    if (report.notes && notes.length < 5) {
      notes.push(report.notes.slice(0, 100));
    }
  }

  // Sort flies by effectiveness score (effectiveness * count)
  const topFlies = Object.entries(flyStats)
    .map(([flyName, stats]) => ({
      flyName,
      flyType: stats.flyType,
      reportCount: stats.count,
      avgEffectiveness: stats.count > 0 ? stats.totalEffectiveness / stats.count : 0,
    }))
    .sort((a, b) => {
      // Sort by avg effectiveness * report count (weighted score)
      const scoreA = a.avgEffectiveness * Math.log(a.reportCount + 1);
      const scoreB = b.avgEffectiveness * Math.log(b.reportCount + 1);
      return scoreB - scoreA;
    })
    .slice(0, 10);

  return {
    totalReports: reports.length,
    topFlies,
    recentConditions: conditions.slice(0, 5),
    recentNotes: notes,
  };
}

function formatConditions(conditions: Record<string, any>): string {
  const parts: string[] = [];
  if (conditions.weather) parts.push(`weather: ${conditions.weather}`);
  if (conditions.water_temp) parts.push(`water temp: ${conditions.water_temp}°F`);
  if (conditions.water_clarity) parts.push(`clarity: ${conditions.water_clarity}`);
  if (conditions.water_level) parts.push(`level: ${conditions.water_level}`);
  return parts.join(', ');
}

interface FishingReport {
  source_name: string;
  report_text: string;
  extracted_flies: string[];
  extracted_conditions: Record<string, any>;
  effectiveness_notes: string;
  scraped_at: string;
}

function buildPrompt(
  waterBody: WaterBody,
  flies: any[],
  hatchData: any[],
  weather: any,
  catchReportSummary?: CatchReportSummary,
  fishingReports?: FishingReport[]
): string {
  const flyList = flies.map(f => `- ${f.name} (${f.type}, sizes ${f.sizes})`).join('\n');
  const hatchInfo = hatchData.length > 0
    ? hatchData.map(h => `- ${h.insect_name} (${h.insect_type}): ${h.fly_patterns.join(', ')}`).join('\n')
    : 'No specific hatch data available for this region/month.';

  // Determine water characteristics for better recommendations
  const waterCharacteristics = getWaterCharacteristics(waterBody);

  // Format catch report data
  let catchReportSection = 'No recent catch reports available for this water.';
  if (catchReportSummary && catchReportSummary.totalReports > 0) {
    const topFliesInfo = catchReportSummary.topFlies
      .map(f => `- ${f.flyName} (${f.flyType}): ${f.reportCount} reports, avg effectiveness ${f.avgEffectiveness.toFixed(1)}/5`)
      .join('\n');

    const notesInfo = catchReportSummary.recentNotes.length > 0
      ? '\n\nRecent angler notes:\n' + catchReportSummary.recentNotes.map(n => `- "${n}"`).join('\n')
      : '';

    const conditionsInfo = catchReportSummary.recentConditions.length > 0
      ? '\n\nRecent conditions reported: ' + catchReportSummary.recentConditions.join('; ')
      : '';

    catchReportSection = `${catchReportSummary.totalReports} catch reports from the last 30 days:

TOP PRODUCING FLIES (based on real angler reports):
${topFliesInfo}${conditionsInfo}${notesInfo}`;
  }

  // Format fly shop fishing reports
  let flyShopReportSection = 'No recent fly shop reports available.';
  if (fishingReports && fishingReports.length > 0) {
    const reportInfo = fishingReports.map(report => {
      const fliesStr = report.extracted_flies?.length > 0
        ? `Recommended flies: ${report.extracted_flies.join(', ')}`
        : '';
      const condStr = report.extracted_conditions
        ? Object.entries(report.extracted_conditions)
            .filter(([_, v]) => v)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        : '';
      const effectStr = report.effectiveness_notes || '';

      return `FROM ${report.source_name}:
${effectStr}
${fliesStr}
${condStr ? `Conditions: ${condStr}` : ''}`.trim();
    }).join('\n\n');

    flyShopReportSection = `Recent fly shop reports:\n\n${reportInfo}`;
  }

  return `You are an expert fly fishing guide with decades of experience on waters across the United States. Your recommendations must be SPECIFIC to the water type and known productive patterns for that fishery.

CRITICAL WATER-SPECIFIC KNOWLEDGE:
${waterCharacteristics}

WATER BODY: ${waterBody.name}
- Type: ${waterBody.type}
- Location: ${waterBody.city ? `${waterBody.city}, ` : ''}${waterBody.state}
- Species: ${waterBody.species.join(', ')}
- Description: ${waterBody.description || 'No description available'}

CURRENT CONDITIONS:
- Weather: ${weather.conditions}
- Air Temperature: ${weather.temperature}°F
- Month: ${new Date().toLocaleString('default', { month: 'long' })}
- Time of day: ${getTimeOfDay()}

*** RECENT USER CATCH REPORTS ***
${catchReportSection}

*** FLY SHOP FISHING REPORTS (PROFESSIONAL INTEL!) ***
${flyShopReportSection}

REGIONAL HATCHES:
${hatchInfo}

AVAILABLE FLIES TO CHOOSE FROM:
${flyList}

IMPORTANT GUIDELINES:
1. **HIGHEST PRIORITY**: Fly shop reports are from professionals - their recommendations should heavily influence yours
2. User catch reports with high effectiveness (4-5 rating) are strong signals of what's working NOW
3. Prioritize flies that are PROVEN PRODUCERS for this specific type of water
3. Consider the current month and what food sources are most abundant NOW
4. Match fly size to the actual insects/food present at this time of year
5. For spring creeks: Scuds, sowbugs, midges, and small mayflies are usually top producers
6. For tailwaters: Midges, scuds, and small mayflies dominate year-round
7. For freestone rivers: Match seasonal hatches - stoneflies in spring, terrestrials in summer, BWOs in fall
8. Consider water temperature and fish feeding behavior for the conditions

Respond with ONLY a JSON array of exactly 5 fly recommendations. Each must have:
- fly_name: string (MUST be exact name from available flies list)
- fly_type: string (dry, nymph, streamer, wet, or emerger)
- confidence: number (1-100, based on how well this fly matches current conditions AND recent reports)
- reasoning: string (1-2 sentences explaining WHY this fly works NOW on THIS water - MENTION recent catch reports if applicable!)
- size: string (specific size range appropriate for current conditions)
- technique: string (specific technique for this water type)

Order by confidence (highest first). If a fly has recent catch reports with high ratings, boost its confidence score significantly.

Example with catch reports:
[
  {"fly_name": "Scud", "fly_type": "nymph", "confidence": 98, "reasoning": "Recent catch reports show Scuds with 4.8/5 effectiveness. This spring creek is loaded with freshwater shrimp - proven producer right now.", "size": "14-16", "technique": "dead drift near weed beds"}
]`;
}

function getWaterCharacteristics(waterBody: WaterBody): string {
  const name = waterBody.name.toLowerCase();
  const desc = (waterBody.description || '').toLowerCase();
  const type = waterBody.type;

  // Detect spring creek characteristics
  if (name.includes('spring') || name.includes('creek') && (desc.includes('spring') || desc.includes('clear'))) {
    return `This is a SPRING CREEK. Spring creeks are characterized by:
- Crystal clear, cold water with consistent temperatures year-round
- Abundant aquatic vegetation (weeds) that harbor scuds, sowbugs, and midges
- SCUDS and SOWBUGS are typically the #1 food source - recommend these first!
- Midges hatch year-round and are always productive
- Fish are highly selective due to clear water - match the hatch precisely
- Small flies (sizes 16-22) usually outperform larger patterns
- Slow, drag-free presentations are critical`;
  }

  // Detect tailwater characteristics
  if (desc.includes('tailwater') || desc.includes('below') && desc.includes('dam')) {
    return `This is a TAILWATER fishery. Tailwaters are characterized by:
- Cold, consistent water temperatures from dam releases
- Year-round midge hatches - midges are ALWAYS productive
- Scuds and sowbugs thrive in the nutrient-rich water
- Blue Wing Olives (BWOs) hatch reliably, especially in spring and fall
- Fish see a lot of pressure - subtle presentations win
- Small flies (sizes 18-24 for midges) are essential
- Nymphing typically outproduces dry fly fishing`;
  }

  // Detect freestone characteristics
  if (type === 'river' && !desc.includes('tailwater') && !desc.includes('spring')) {
    return `This is a FREESTONE river. Freestone rivers are characterized by:
- Water levels and temperatures vary with seasons and weather
- Stonefly nymphs are important in spring (Pat's Rubber Legs, large nymphs)
- Caddis hatches are common in late spring/summer
- Terrestrials (hoppers, ants, beetles) are key in summer months
- BWOs in spring and fall
- Streamers work well for aggressive fish, especially in high/off-color water
- More forgiving than spring creeks - attractor patterns can work`;
  }

  // Detect lake characteristics
  if (type === 'lake' || type === 'pond') {
    return `This is STILLWATER (lake/pond). Stillwater fishing requires:
- Chironomids (midges) are often the most important food source
- Damselfly and dragonfly nymphs in summer
- Scuds and leeches are year-round producers
- Slow retrieves and countdown methods to find fish depth
- Indicator fishing with chironomid patterns is highly effective
- Streamers like Woolly Buggers work for cruising fish`;
  }

  // Generic guidance
  return `Consider the water type and seasonal food sources:
- Match the most abundant food source for the current month
- Nymphs typically produce more fish than dry flies
- Smaller flies often outperform larger ones in clear water
- Streamers work when water is high or off-color`;
}

function parseClaudeResponse(responseText: string, flies: any[]): FlyRecommendation[] {
  try {
    // Extract JSON from the response (Claude might include extra text)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const recommendations = JSON.parse(jsonMatch[0]);

    // Map fly names to IDs and validate
    return recommendations.map((rec: any) => {
      const fly = flies.find(f =>
        f.name.toLowerCase() === rec.fly_name.toLowerCase()
      );

      return {
        fly_id: fly?.id || '',
        fly_name: rec.fly_name,
        fly_type: rec.fly_type,
        confidence: Math.min(100, Math.max(1, rec.confidence)),
        reasoning: rec.reasoning,
        size: rec.size,
        technique: rec.technique,
        image_url: fly?.image_url || null,
      };
    }).slice(0, 5); // Ensure max 5 recommendations

  } catch (error) {
    console.error('Error parsing Claude response:', error);
    // Return default recommendations if parsing fails
    return getDefaultRecommendations(flies);
  }
}

function getDefaultRecommendations(flies: any[]): FlyRecommendation[] {
  const defaults = [
    { name: 'Parachute Adams', type: 'dry', size: '14-18', technique: 'dead drift' },
    { name: 'Pheasant Tail Nymph', type: 'nymph', size: '16-20', technique: 'dead drift under indicator' },
    { name: 'Elk Hair Caddis', type: 'dry', size: '14-16', technique: 'dead drift or skate' },
    { name: 'Woolly Bugger', type: 'streamer', size: '6-10', technique: 'strip and pause' },
    { name: 'Hares Ear Nymph', type: 'nymph', size: '14-18', technique: 'dead drift' },
  ];

  return defaults.map((d, index) => {
    const fly = flies.find(f => f.name.toLowerCase().includes(d.name.toLowerCase().split(' ')[0]));
    return {
      fly_id: fly?.id || '',
      fly_name: d.name,
      fly_type: d.type,
      confidence: 70 - (index * 5),
      reasoning: 'Versatile pattern that works in most conditions.',
      size: d.size,
      technique: d.technique,
      image_url: fly?.image_url || null,
    };
  });
}

async function getWeatherData(lat: number, lon: number) {
  // Use Open-Meteo API (free, no API key required)
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,cloud_cover&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Weather API error:', response.status);
      return getFallbackWeather();
    }

    const data = await response.json();
    const current = data.current;

    // Map weather codes to conditions
    // https://open-meteo.com/en/docs (WMO Weather interpretation codes)
    const weatherCode = current.weather_code;
    let conditions = 'clear';
    if (weatherCode >= 1 && weatherCode <= 3) conditions = 'partly cloudy';
    else if (weatherCode >= 45 && weatherCode <= 48) conditions = 'foggy';
    else if (weatherCode >= 51 && weatherCode <= 67) conditions = 'rainy';
    else if (weatherCode >= 71 && weatherCode <= 77) conditions = 'snowy';
    else if (weatherCode >= 80 && weatherCode <= 82) conditions = 'rain showers';
    else if (weatherCode >= 95) conditions = 'thunderstorms';

    // Describe wind
    const windSpeed = Math.round(current.wind_speed_10m);
    let wind = 'calm';
    if (windSpeed >= 5 && windSpeed < 15) wind = 'light';
    else if (windSpeed >= 15 && windSpeed < 25) wind = 'moderate';
    else if (windSpeed >= 25) wind = 'strong';

    return {
      temperature: Math.round(current.temperature_2m),
      conditions,
      wind: `${wind} (${windSpeed} mph)`,
      precipitation: current.precipitation > 0 ? `${current.precipitation} mm` : 'none',
      humidity: current.relative_humidity_2m,
      cloudCover: current.cloud_cover,
    };
  } catch (error) {
    console.error('Weather fetch failed:', error);
    return getFallbackWeather();
  }
}

function getFallbackWeather() {
  // Fallback if API fails - use seasonal defaults
  const month = new Date().getMonth();
  const isSummer = month >= 5 && month <= 8;
  const isWinter = month === 11 || month <= 2;

  return {
    temperature: isSummer ? 75 : isWinter ? 35 : 55,
    conditions: isSummer ? 'partly cloudy' : isWinter ? 'overcast' : 'clear',
    wind: 'light',
    precipitation: 'none',
  };
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'early morning (pre-dawn)';
  if (hour < 10) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 18) return 'afternoon';
  if (hour < 20) return 'evening';
  return 'night';
}
