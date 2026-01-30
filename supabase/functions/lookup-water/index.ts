// Supabase Edge Function: Lookup Water Bodies from External APIs
// Queries USGS and other public APIs to find water bodies not in our database
// Deploy with: supabase functions deploy lookup-water

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// USGS Water Services API endpoints
const USGS_SITE_SERVICE = 'https://waterservices.usgs.gov/nwis/site/';
const GNIS_API = 'https://geonames.usgs.gov/api/search';

interface SearchParams {
  query: string;
  state?: string;
  limit?: number;
}

interface ExternalWaterBody {
  id: string;
  name: string;
  type: 'river' | 'lake' | 'stream' | 'creek' | 'pond';
  state: string;
  county?: string;
  latitude: number;
  longitude: number;
  source: 'usgs' | 'gnis';
  usgs_site_id?: string;
  huc?: string; // Hydrologic Unit Code
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, state, limit = 20 }: SearchParams = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedQuery = query.trim();

    // Search multiple sources in parallel
    const [usgsResults, gnisResults] = await Promise.all([
      searchUSGSSites(trimmedQuery, state, limit),
      searchGNIS(trimmedQuery, state, limit),
    ]);

    // Combine and deduplicate results
    const allResults = [...usgsResults, ...gnisResults];
    const deduplicatedResults = deduplicateResults(allResults, trimmedQuery);

    // Sort by relevance (exact matches first, then by name similarity)
    const sortedResults = sortByRelevance(deduplicatedResults, trimmedQuery);

    return new Response(
      JSON.stringify({
        results: sortedResults.slice(0, limit),
        sources: {
          usgs: usgsResults.length,
          gnis: gnisResults.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error looking up water bodies:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to search external water databases' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Search USGS Water Services for stream/river sites
 * https://waterservices.usgs.gov/docs/site-service/
 */
async function searchUSGSSites(query: string, state?: string, limit = 20): Promise<ExternalWaterBody[]> {
  try {
    const params = new URLSearchParams({
      format: 'rdb',
      siteStatus: 'all',
    });

    // If a state is provided, search within that state
    if (state && state.length === 2) {
      params.append('stateCd', state.toUpperCase());
    }

    // USGS API supports partial name matches with % wildcards
    const searchPattern = `%${query}%`;
    params.append('siteName', searchPattern);

    const response = await fetch(`${USGS_SITE_SERVICE}?${params}`, {
      headers: {
        'Accept': 'text/plain',
      },
    });

    if (!response.ok) {
      console.error('USGS API error:', response.status, await response.text());
      return [];
    }

    const text = await response.text();
    return parseUSGSResponse(text, limit);
  } catch (error) {
    console.error('USGS search error:', error);
    return [];
  }
}

/**
 * Parse USGS RDB (tab-delimited) format response
 */
function parseUSGSResponse(rdbText: string, limit: number): ExternalWaterBody[] {
  const results: ExternalWaterBody[] = [];
  const lines = rdbText.split('\n');

  // Skip comment lines (start with #) and header lines
  let dataStarted = false;
  let headers: string[] = [];

  for (const line of lines) {
    if (line.startsWith('#')) continue;

    if (!dataStarted) {
      // First non-comment line is headers
      if (line.includes('site_no')) {
        headers = line.split('\t').map(h => h.trim());
        dataStarted = true;
      }
      continue;
    }

    // Skip the format specification line (contains column widths like "15s")
    if (line.match(/^\d+s?\t/)) continue;

    // Parse data line
    const values = line.split('\t');
    if (values.length < 5) continue;

    const getValue = (name: string): string => {
      const idx = headers.indexOf(name);
      return idx >= 0 && idx < values.length ? values[idx].trim() : '';
    };

    const siteNo = getValue('site_no');
    const siteName = getValue('station_nm');
    const siteType = getValue('site_tp_cd');
    const lat = parseFloat(getValue('dec_lat_va'));
    const lon = parseFloat(getValue('dec_long_va'));
    const stateCode = getValue('state_cd');
    const countyCode = getValue('county_cd');
    const huc = getValue('huc_cd');

    if (!siteName || isNaN(lat) || isNaN(lon)) continue;

    // Map USGS site type codes to our water types
    const waterType = mapUSGSSiteType(siteType);

    results.push({
      id: `usgs-${siteNo}`,
      name: formatSiteName(siteName),
      type: waterType,
      state: stateCodeToAbbr(stateCode) || '',
      county: countyCode,
      latitude: lat,
      longitude: lon,
      source: 'usgs',
      usgs_site_id: siteNo,
      huc,
    });

    if (results.length >= limit * 2) break; // Get extra for deduplication
  }

  return results;
}

/**
 * Search USGS Geographic Names Information System (GNIS)
 * Note: The old GNIS API has been deprecated. This function is kept for
 * potential future use with an updated endpoint.
 */
async function searchGNIS(_query: string, _state?: string, _limit = 20): Promise<ExternalWaterBody[]> {
  // GNIS API at geonames.usgs.gov has been deprecated/moved
  // The USGS Water Services API provides sufficient coverage for water bodies
  // Return empty array for now - USGS search handles most cases
  return [];
}

/**
 * Map USGS site type codes to our water body types
 */
function mapUSGSSiteType(siteType: string): ExternalWaterBody['type'] {
  switch (siteType) {
    case 'ST':
    case 'ST-CA':
    case 'ST-DCH':
    case 'ST-TS':
      return 'stream';
    case 'LK':
      return 'lake';
    case 'SP':
      return 'creek'; // Springs often feed creeks
    default:
      return 'river';
  }
}

/**
 * Map GNIS feature classes to our water body types
 */
function mapGNISFeatureClass(featureClass: string): ExternalWaterBody['type'] {
  const fc = (featureClass || '').toLowerCase();
  if (fc.includes('lake') || fc.includes('reservoir')) return 'lake';
  if (fc.includes('stream')) return 'stream';
  if (fc.includes('spring')) return 'creek';
  if (fc.includes('swamp')) return 'pond';
  return 'river';
}

/**
 * Convert USGS state FIPS code to state abbreviation
 */
function stateCodeToAbbr(fipsCode: string): string {
  const fipsToState: Record<string, string> = {
    '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
    '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
    '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
    '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
    '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
    '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
    '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
    '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
    '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
    '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
    '56': 'WY', '60': 'AS', '66': 'GU', '69': 'MP', '72': 'PR',
    '78': 'VI',
  };
  return fipsToState[fipsCode] || '';
}

/**
 * Format site name to be more readable
 */
function formatSiteName(name: string): string {
  // Remove common USGS prefixes/suffixes
  let formatted = name
    .replace(/\bNR\b/gi, 'near')
    .replace(/\bAB\b/gi, 'above')
    .replace(/\bBL\b/gi, 'below')
    .replace(/\bAT\b/gi, 'at')
    .replace(/\s+/g, ' ')
    .trim();

  // Title case
  formatted = formatted.split(' ').map(word => {
    // Keep state abbreviations uppercase
    if (word.length === 2 && word === word.toUpperCase()) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  return formatted;
}

/**
 * Deduplicate results based on name and location similarity
 */
function deduplicateResults(results: ExternalWaterBody[], query: string): ExternalWaterBody[] {
  const seen = new Map<string, ExternalWaterBody>();

  for (const result of results) {
    // Create a key based on normalized name and approximate location
    const normalizedName = result.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const latKey = Math.round(result.latitude * 100);
    const lonKey = Math.round(result.longitude * 100);
    const key = `${normalizedName}-${latKey}-${lonKey}`;

    // Prefer USGS results as they have site IDs for water data
    if (!seen.has(key) || (result.source === 'usgs' && seen.get(key)?.source !== 'usgs')) {
      seen.set(key, result);
    }
  }

  return Array.from(seen.values());
}

/**
 * Sort results by relevance to the search query
 */
function sortByRelevance(results: ExternalWaterBody[], query: string): ExternalWaterBody[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  return results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    // Exact matches first
    if (aName === queryLower && bName !== queryLower) return -1;
    if (bName === queryLower && aName !== queryLower) return 1;

    // Starts with query
    if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
    if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;

    // Contains all query words
    const aHasAllWords = queryWords.every(w => aName.includes(w));
    const bHasAllWords = queryWords.every(w => bName.includes(w));
    if (aHasAllWords && !bHasAllWords) return -1;
    if (bHasAllWords && !aHasAllWords) return 1;

    // USGS results preferred (they have water data)
    if (a.source === 'usgs' && b.source !== 'usgs') return -1;
    if (b.source === 'usgs' && a.source !== 'usgs') return 1;

    // Alphabetical
    return aName.localeCompare(bName);
  });
}
