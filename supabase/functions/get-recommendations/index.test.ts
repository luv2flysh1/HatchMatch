// Edge Function Tests for get-recommendations
// Run with: deno test --allow-env supabase/functions/get-recommendations/index.test.ts

import {
  assertEquals,
  assertExists,
  assert,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';

// Helper assertions
function assertGreater(actual: number, expected: number, msg?: string) {
  assert(actual > expected, msg || `Expected ${actual} > ${expected}`);
}

function assertLessOrEqual(actual: number, expected: number, msg?: string) {
  assert(actual <= expected, msg || `Expected ${actual} <= ${expected}`);
}

// ============================================
// Extract testable functions from index.ts
// We need to refactor or duplicate them for testing
// ============================================

interface WaterBody {
  id: string;
  name: string;
  type: string;
  state: string;
  city: string | null;
  species: string[];
  description: string | null;
  latitude?: number;
  longitude?: number;
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

// Copied from index.ts for testing (ideally these would be exported)
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
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const recommendations = JSON.parse(jsonMatch[0]);

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
    }).slice(0, 5);

  } catch (_error) {
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

function getWeatherData(_lat: number, _lon: number) {
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

// ============================================
// Test Data
// ============================================

const mockWaterBody: WaterBody = {
  id: 'water-1',
  name: 'South Platte River',
  type: 'river',
  state: 'CO',
  city: 'Denver',
  species: ['rainbow trout', 'brown trout'],
  description: 'Popular urban tailwater fishery',
  latitude: 39.7392,
  longitude: -104.9903,
};

const mockFlies = [
  { id: 'fly-1', name: 'Parachute Adams', type: 'dry', sizes: '14-20' },
  { id: 'fly-2', name: 'Pheasant Tail Nymph', type: 'nymph', sizes: '14-20' },
  { id: 'fly-3', name: 'Elk Hair Caddis', type: 'dry', sizes: '12-18' },
  { id: 'fly-4', name: 'Woolly Bugger', type: 'streamer', sizes: '4-10' },
  { id: 'fly-5', name: 'Hares Ear Nymph', type: 'nymph', sizes: '12-18' },
  { id: 'fly-6', name: 'Blue Wing Olive', type: 'dry', sizes: '18-24' },
];

const mockHatchData = [
  {
    insect_name: 'Blue Wing Olive',
    insect_type: 'mayfly',
    fly_patterns: ['Parachute BWO', 'RS2', 'Sparkle Dun'],
  },
];

const mockWeather = {
  temperature: 55,
  conditions: 'partly cloudy',
  wind: 'light',
  precipitation: 'none',
};

// ============================================
// Tests: buildPrompt
// ============================================

Deno.test('buildPrompt - includes water body name', () => {
  const prompt = buildPrompt(mockWaterBody, mockFlies, [], mockWeather);
  assertEquals(prompt.includes('South Platte River'), true);
});

Deno.test('buildPrompt - includes water body type', () => {
  const prompt = buildPrompt(mockWaterBody, mockFlies, [], mockWeather);
  assertEquals(prompt.includes('river'), true);
});

Deno.test('buildPrompt - includes state', () => {
  const prompt = buildPrompt(mockWaterBody, mockFlies, [], mockWeather);
  assertEquals(prompt.includes('CO'), true);
});

Deno.test('buildPrompt - includes species', () => {
  const prompt = buildPrompt(mockWaterBody, mockFlies, [], mockWeather);
  assertEquals(prompt.includes('rainbow trout'), true);
  assertEquals(prompt.includes('brown trout'), true);
});

Deno.test('buildPrompt - includes weather conditions', () => {
  const prompt = buildPrompt(mockWaterBody, mockFlies, [], mockWeather);
  assertEquals(prompt.includes('partly cloudy'), true);
  assertEquals(prompt.includes('55°F'), true);
});

Deno.test('buildPrompt - includes fly list', () => {
  const prompt = buildPrompt(mockWaterBody, mockFlies, [], mockWeather);
  assertEquals(prompt.includes('Parachute Adams'), true);
  assertEquals(prompt.includes('Pheasant Tail Nymph'), true);
  assertEquals(prompt.includes('Woolly Bugger'), true);
});

Deno.test('buildPrompt - includes hatch data when available', () => {
  const prompt = buildPrompt(mockWaterBody, mockFlies, mockHatchData, mockWeather);
  assertEquals(prompt.includes('Blue Wing Olive'), true);
  assertEquals(prompt.includes('mayfly'), true);
});

Deno.test('buildPrompt - shows no hatch message when empty', () => {
  const prompt = buildPrompt(mockWaterBody, mockFlies, [], mockWeather);
  assertEquals(prompt.includes('No specific hatch data available'), true);
});

Deno.test('buildPrompt - requests JSON array format', () => {
  const prompt = buildPrompt(mockWaterBody, mockFlies, [], mockWeather);
  assertEquals(prompt.includes('JSON array'), true);
  assertEquals(prompt.includes('exactly 5 fly recommendations'), true);
});

Deno.test('buildPrompt - handles missing city', () => {
  const waterBodyNoCity = { ...mockWaterBody, city: null };
  const prompt = buildPrompt(waterBodyNoCity, mockFlies, [], mockWeather);
  assertEquals(prompt.includes('Location: CO'), true);
});

Deno.test('buildPrompt - handles missing description', () => {
  const waterBodyNoDesc = { ...mockWaterBody, description: null };
  const prompt = buildPrompt(waterBodyNoDesc, mockFlies, [], mockWeather);
  assertEquals(prompt.includes('No description available'), true);
});

// ============================================
// Tests: parseClaudeResponse
// ============================================

Deno.test('parseClaudeResponse - parses valid JSON array', () => {
  const response = `[
    {"fly_name": "Parachute Adams", "fly_type": "dry", "confidence": 85, "reasoning": "Great for hatches", "size": "14-18", "technique": "dead drift"}
  ]`;

  const result = parseClaudeResponse(response, mockFlies);

  assertEquals(result.length, 1);
  assertEquals(result[0].fly_name, 'Parachute Adams');
  assertEquals(result[0].fly_type, 'dry');
  assertEquals(result[0].confidence, 85);
});

Deno.test('parseClaudeResponse - maps fly_id from database', () => {
  const response = `[
    {"fly_name": "Parachute Adams", "fly_type": "dry", "confidence": 85, "reasoning": "Great", "size": "14-18", "technique": "dead drift"}
  ]`;

  const result = parseClaudeResponse(response, mockFlies);

  assertEquals(result[0].fly_id, 'fly-1');
});

Deno.test('parseClaudeResponse - handles case-insensitive fly matching', () => {
  const response = `[
    {"fly_name": "parachute adams", "fly_type": "dry", "confidence": 85, "reasoning": "Great", "size": "14-18", "technique": "dead drift"}
  ]`;

  const result = parseClaudeResponse(response, mockFlies);

  assertEquals(result[0].fly_id, 'fly-1');
});

Deno.test('parseClaudeResponse - handles unknown fly (empty id)', () => {
  const response = `[
    {"fly_name": "Unknown Fly Pattern", "fly_type": "dry", "confidence": 85, "reasoning": "Great", "size": "14-18", "technique": "dead drift"}
  ]`;

  const result = parseClaudeResponse(response, mockFlies);

  assertEquals(result[0].fly_id, '');
  assertEquals(result[0].fly_name, 'Unknown Fly Pattern');
});

Deno.test('parseClaudeResponse - clamps confidence to 1-100', () => {
  const response = `[
    {"fly_name": "Parachute Adams", "fly_type": "dry", "confidence": 150, "reasoning": "Great", "size": "14-18", "technique": "dead drift"},
    {"fly_name": "Woolly Bugger", "fly_type": "streamer", "confidence": -10, "reasoning": "Great", "size": "6-10", "technique": "strip"}
  ]`;

  const result = parseClaudeResponse(response, mockFlies);

  assertEquals(result[0].confidence, 100);
  assertEquals(result[1].confidence, 1);
});

Deno.test('parseClaudeResponse - limits to 5 recommendations', () => {
  const response = `[
    {"fly_name": "Fly 1", "fly_type": "dry", "confidence": 90, "reasoning": "A", "size": "14", "technique": "drift"},
    {"fly_name": "Fly 2", "fly_type": "dry", "confidence": 85, "reasoning": "B", "size": "14", "technique": "drift"},
    {"fly_name": "Fly 3", "fly_type": "dry", "confidence": 80, "reasoning": "C", "size": "14", "technique": "drift"},
    {"fly_name": "Fly 4", "fly_type": "dry", "confidence": 75, "reasoning": "D", "size": "14", "technique": "drift"},
    {"fly_name": "Fly 5", "fly_type": "dry", "confidence": 70, "reasoning": "E", "size": "14", "technique": "drift"},
    {"fly_name": "Fly 6", "fly_type": "dry", "confidence": 65, "reasoning": "F", "size": "14", "technique": "drift"},
    {"fly_name": "Fly 7", "fly_type": "dry", "confidence": 60, "reasoning": "G", "size": "14", "technique": "drift"}
  ]`;

  const result = parseClaudeResponse(response, mockFlies);

  assertEquals(result.length, 5);
});

Deno.test('parseClaudeResponse - extracts JSON from text with preamble', () => {
  const response = `Here are my recommendations based on the conditions:

  [
    {"fly_name": "Parachute Adams", "fly_type": "dry", "confidence": 85, "reasoning": "Great for hatches", "size": "14-18", "technique": "dead drift"}
  ]

  These should work well in the current conditions.`;

  const result = parseClaudeResponse(response, mockFlies);

  assertEquals(result.length, 1);
  assertEquals(result[0].fly_name, 'Parachute Adams');
});

Deno.test('parseClaudeResponse - returns defaults for invalid JSON', () => {
  const response = 'This is not valid JSON at all';

  const result = parseClaudeResponse(response, mockFlies);

  assertEquals(result.length, 5);
  assertEquals(result[0].fly_name, 'Parachute Adams');
  assertEquals(result[0].reasoning, 'Versatile pattern that works in most conditions.');
});

Deno.test('parseClaudeResponse - returns defaults for empty response', () => {
  const response = '';

  const result = parseClaudeResponse(response, mockFlies);

  assertEquals(result.length, 5);
});

// ============================================
// Tests: getDefaultRecommendations
// ============================================

Deno.test('getDefaultRecommendations - returns 5 recommendations', () => {
  const result = getDefaultRecommendations(mockFlies);
  assertEquals(result.length, 5);
});

Deno.test('getDefaultRecommendations - has decreasing confidence', () => {
  const result = getDefaultRecommendations(mockFlies);

  for (let i = 1; i < result.length; i++) {
    assertGreater(result[i - 1].confidence, result[i].confidence);
  }
});

Deno.test('getDefaultRecommendations - maps fly ids when found', () => {
  const result = getDefaultRecommendations(mockFlies);

  // Parachute Adams should match fly-1
  assertEquals(result[0].fly_id, 'fly-1');
});

Deno.test('getDefaultRecommendations - includes required fields', () => {
  const result = getDefaultRecommendations(mockFlies);

  result.forEach(rec => {
    assertExists(rec.fly_id);
    assertExists(rec.fly_name);
    assertExists(rec.fly_type);
    assertExists(rec.confidence);
    assertExists(rec.reasoning);
    assertExists(rec.size);
    assertExists(rec.technique);
  });
});

// ============================================
// Tests: getWeatherData
// ============================================

Deno.test('getWeatherData - returns temperature', () => {
  const result = getWeatherData(39.7392, -104.9903);
  assertExists(result.temperature);
  assertGreater(result.temperature, 0);
  assertLessOrEqual(result.temperature, 100);
});

Deno.test('getWeatherData - returns conditions', () => {
  const result = getWeatherData(39.7392, -104.9903);
  assertExists(result.conditions);
  assertEquals(typeof result.conditions, 'string');
});

Deno.test('getWeatherData - returns wind', () => {
  const result = getWeatherData(39.7392, -104.9903);
  assertEquals(result.wind, 'light');
});

Deno.test('getWeatherData - returns precipitation', () => {
  const result = getWeatherData(39.7392, -104.9903);
  assertEquals(result.precipitation, 'none');
});

// ============================================
// Tests: getTimeOfDay
// ============================================

Deno.test('getTimeOfDay - returns string', () => {
  const result = getTimeOfDay();
  assertEquals(typeof result, 'string');
  assertGreater(result.length, 0);
});

Deno.test('getTimeOfDay - returns valid time period', () => {
  const result = getTimeOfDay();
  const validPeriods = [
    'early morning (pre-dawn)',
    'morning',
    'midday',
    'afternoon',
    'evening',
    'night',
  ];
  assertEquals(validPeriods.includes(result), true);
});

// ============================================
// Tests: Claude API Model Name (Contract Test)
// ============================================

Deno.test('Claude API - model name is valid', async () => {
  // This test verifies the model name we're using is valid
  // It makes a minimal API call to check
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    console.log('Skipping Claude API test - ANTHROPIC_API_KEY not set');
    return;
  }

  const MODEL_NAME = 'claude-3-haiku-20240307'; // Must match index.ts

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    }),
  });

  // Consume the response body to avoid resource leak
  await response.text();

  assertEquals(response.ok, true, `Model ${MODEL_NAME} should be valid`);
});

// ============================================
// Tests: Full Integration (with mocked fetch)
// ============================================

Deno.test('Integration - recommendation flow produces valid output', () => {
  // Simulate the full flow without actual API calls
  const weather = getWeatherData(mockWaterBody.latitude!, mockWaterBody.longitude!);
  const prompt = buildPrompt(mockWaterBody, mockFlies, mockHatchData, weather);

  // Simulate Claude response
  const mockClaudeResponse = `[
    {"fly_name": "Parachute Adams", "fly_type": "dry", "confidence": 90, "reasoning": "BWO hatch expected", "size": "18-20", "technique": "dead drift"},
    {"fly_name": "Pheasant Tail Nymph", "fly_type": "nymph", "confidence": 85, "reasoning": "Subsurface activity", "size": "16-18", "technique": "euro nymph"},
    {"fly_name": "Blue Wing Olive", "fly_type": "dry", "confidence": 80, "reasoning": "Match the hatch", "size": "20-22", "technique": "dead drift"},
    {"fly_name": "Hares Ear Nymph", "fly_type": "nymph", "confidence": 75, "reasoning": "Good searching pattern", "size": "14-16", "technique": "dead drift"},
    {"fly_name": "Elk Hair Caddis", "fly_type": "dry", "confidence": 70, "reasoning": "Evening activity", "size": "14-16", "technique": "skate"}
  ]`;

  const recommendations = parseClaudeResponse(mockClaudeResponse, mockFlies);

  // Verify output structure
  assertEquals(recommendations.length, 5);
  assertEquals(recommendations[0].fly_name, 'Parachute Adams');
  assertEquals(recommendations[0].fly_id, 'fly-1'); // Mapped from mockFlies
  assertGreater(recommendations[0].confidence, recommendations[4].confidence);
});
