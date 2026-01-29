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

    // Get current weather (mock for now - would integrate weather API)
    const weather = await getWeatherData(waterBody.latitude, waterBody.longitude);

    // Build the prompt for Claude
    const prompt = buildPrompt(waterBody, flies || [], hatchData || [], weather);

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
        model: 'claude-3-5-haiku-20241022',
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

    return new Response(
      JSON.stringify({
        recommendations,
        conditions_summary: `Based on ${weather.conditions} conditions with ${weather.temperature}°F air temp.`,
        water_body: waterBody.name,
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

function buildPrompt(
  waterBody: WaterBody,
  flies: any[],
  hatchData: any[],
  weather: any
): string {
  const flyList = flies.map(f => `- ${f.name} (${f.type}, sizes ${f.sizes})`).join('\n');
  const hatchInfo = hatchData.length > 0
    ? hatchData.map(h => `- ${h.insect_name} (${h.insect_type}): ${h.fly_patterns.join(', ')}`).join('\n')
    : 'No specific hatch data available for this region/month.';

  return `You are an expert fly fishing guide. Recommend the top 5 flies for fishing at ${waterBody.name}, a ${waterBody.type} in ${waterBody.state}.

WATER BODY INFO:
- Type: ${waterBody.type}
- Location: ${waterBody.city ? `${waterBody.city}, ` : ''}${waterBody.state}
- Species present: ${waterBody.species.join(', ')}
- Description: ${waterBody.description || 'No description available'}

CURRENT CONDITIONS:
- Weather: ${weather.conditions}
- Air Temperature: ${weather.temperature}°F
- Month: ${new Date().toLocaleString('default', { month: 'long' })}
- Time of day: ${getTimeOfDay()}

CURRENT HATCHES IN REGION:
${hatchInfo}

AVAILABLE FLIES:
${flyList}

Respond with ONLY a JSON array of exactly 5 fly recommendations. Each recommendation must have these fields:
- fly_name: string (exact name from the available flies list)
- fly_type: string (dry, nymph, streamer, wet, or emerger)
- confidence: number (1-100, how confident you are this fly will work)
- reasoning: string (1-2 sentences explaining why this fly, referencing conditions)
- size: string (recommended size range like "14-18")
- technique: string (how to fish it, e.g., "dead drift", "swing", "strip")

Order by confidence (highest first). Example format:
[
  {"fly_name": "Parachute Adams", "fly_type": "dry", "confidence": 85, "reasoning": "...", "size": "14-18", "technique": "dead drift"}
]`;
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
    };
  });
}

async function getWeatherData(lat: number, lon: number) {
  // TODO: Integrate real weather API (OpenWeather, etc.)
  // For now, return mock data based on month
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
