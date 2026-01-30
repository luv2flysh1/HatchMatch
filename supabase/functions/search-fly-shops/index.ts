import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const YELP_API_KEY = Deno.env.get('YELP_API_KEY');
const YELP_API_URL = 'https://api.yelp.com/v3/businesses/search';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // in meters, max 40000 (about 25 miles)
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!YELP_API_KEY) {
      throw new Error('YELP_API_KEY not configured');
    }

    const { latitude, longitude, radius = 40000 }: SearchParams = await req.json();

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search Yelp for fly fishing related businesses
    const searchTerms = ['fly fishing', 'fly shop', 'fishing tackle', 'bait and tackle'];
    const allResults: any[] = [];
    const seenIds = new Set<string>();

    // Search with multiple terms to get better coverage
    for (const term of searchTerms) {
      const params = new URLSearchParams({
        term,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: Math.min(radius, 40000).toString(),
        limit: '20',
        sort_by: 'distance',
        categories: 'fishing,sportgoods,outdoorgear',
      });

      const response = await fetch(`${YELP_API_URL}?${params}`, {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Yelp API error for term "${term}":`, await response.text());
        continue;
      }

      const data = await response.json();

      // Deduplicate results
      for (const business of data.businesses || []) {
        if (!seenIds.has(business.id)) {
          seenIds.add(business.id);
          allResults.push(business);
        }
      }
    }

    // Sort by distance and prioritize fly-specific shops
    const sortedResults = allResults
      .map((shop) => ({
        id: shop.id,
        name: shop.name,
        rating: shop.rating,
        reviewCount: shop.review_count,
        phone: shop.display_phone,
        address: shop.location?.display_address?.join(', ') || '',
        city: shop.location?.city || '',
        state: shop.location?.state || '',
        distance: shop.distance, // in meters
        distanceMiles: shop.distance ? (shop.distance / 1609.34).toFixed(1) : null,
        coordinates: shop.coordinates,
        imageUrl: shop.image_url,
        url: shop.url,
        categories: shop.categories?.map((c: any) => c.title) || [],
        isFlyShop: isFlyFishingShop(shop),
      }))
      .sort((a, b) => {
        // Prioritize fly shops, then sort by distance
        if (a.isFlyShop && !b.isFlyShop) return -1;
        if (!a.isFlyShop && b.isFlyShop) return 1;
        return (a.distance || 0) - (b.distance || 0);
      })
      .slice(0, 20); // Return top 20

    return new Response(
      JSON.stringify({ shops: sortedResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error searching fly shops:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to search for fly shops' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Check if a business is likely a fly fishing specific shop
function isFlyFishingShop(business: any): boolean {
  const name = business.name?.toLowerCase() || '';
  const categories = business.categories?.map((c: any) => c.alias).join(' ') || '';

  const flyKeywords = ['fly fish', 'fly shop', 'flies', 'angler', 'outfitter', 'trout'];

  return flyKeywords.some(keyword =>
    name.includes(keyword) || categories.includes(keyword)
  );
}
