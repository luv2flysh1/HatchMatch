# HatchMatch

[![CI](https://github.com/luv2flysh1/HatchMatch/actions/workflows/ci.yml/badge.svg)](https://github.com/luv2flysh1/HatchMatch/actions/workflows/ci.yml)

Your AI-powered fly fishing companion. Get personalized fly recommendations based on real-time conditions, local fishing reports, and seasonal hatches.

## Features

### Fly Recommendations
- **AI-powered suggestions** using Claude to analyze current conditions, weather, and seasonal patterns
- **Local fly shop reports** - scrapes and aggregates fishing reports from nearby fly shops
- **Seasonal accuracy** - recommendations match the current month's hatches (no summer flies in winter!)
- **Water-type intelligence** - understands spring creeks, tailwaters, freestone rivers, and lakes

### Trip Planning
- **Multi-water trips** - plan trips with multiple fishing destinations
- **Aggregated recommendations** - get a unified fly box suggestion across all waters
- **Date tracking** - organize upcoming and past trips

### Water Discovery
- **Search waters** by name across the US
- **Detailed info** - species, access, conditions
- **USGS integration** - real-time flow data where available

### Fly Shops
- **GPS-based search** - find fly shops within 100 miles
- **Quick actions** - call, get directions, visit website

### Fly Box
- **Save recommendations** to your personal fly box
- **Shopping list** - track what you need to buy

## Screenshots

*Coming soon*

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | Expo / React Native |
| Navigation | Expo Router |
| State | Zustand |
| Backend | Supabase (Auth, Database, Edge Functions) |
| AI | Claude API (Anthropic) |
| Weather | Open-Meteo API |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Expo Go app (for mobile testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/luv2flysh1/HatchMatch.git
cd HatchMatch

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
npm start           # Start Expo dev server
npm run android     # Open on Android device/emulator
npm run ios         # Open on iOS simulator (macOS only)
npm run web         # Open in web browser
```

### Running Tests

```bash
npm test                    # Store/utility tests (90 tests)
npm run test:components     # Component tests (111 tests)
npm run test:all            # All tests (201 total)
npm run test:edge           # Edge function tests (Deno)
```

### Building for Distribution

```bash
# Android APK (for testing)
eas build --platform android --profile preview

# Production builds
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Project Structure

```
HatchMatch/
├── src/
│   ├── app/                 # Expo Router screens
│   │   ├── (tabs)/          # Tab navigation (water, trips, shops, profile)
│   │   ├── water/           # Water detail screens
│   │   └── trip/            # Trip management screens
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Supabase client
│   ├── stores/              # Zustand state stores
│   ├── theme/               # Design system (colors, typography, spacing)
│   ├── types/               # TypeScript types
│   └── __tests__/           # Test files
├── supabase/
│   ├── functions/           # Edge functions (recommendations, scraping)
│   ├── migrations/          # Database migrations
│   └── schema.sql           # Full database schema
├── assets/                  # Images, icons
└── .github/workflows/       # CI configuration
```

## Environment Setup

### Supabase

The app uses Supabase for:
- User authentication
- Database (PostgreSQL)
- Edge Functions (Deno)

Project ref: `okntzxxufjxxugtdlfrv`

### Required Secrets (for Edge Functions)

- `ANTHROPIC_API_KEY` - Claude API key for AI recommendations

## Contributing

This project is in active development. Issues and PRs welcome.

## License

Private - All rights reserved.

---

*Built for the fly fishing community*
