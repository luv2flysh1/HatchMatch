# HatchMatch 🎣

A mobile app that tells you which flies are working best on any river or lake. Built with Expo (React Native) for iOS and Android.

## Overview

HatchMatch helps fly anglers:
- **Get fly recommendations** based on current conditions, hatch charts, and weather
- **Plan fishing trips** with single or multiple water bodies
- **Find fly shops** near your destination with directions
- **Log catches** to improve recommendations for the community

## Features

### MVP (Phase 1)
- [x] User authentication (email/password)
- [ ] Water body search (by name or GPS)
- [ ] AI-powered fly recommendations
- [ ] Trip planning
- [ ] Fly shop locator

### Phase 2
- [ ] Multi-trip management with auto-refresh
- [ ] Catch reporting with photos
- [ ] Offline mode
- [ ] Purchase links to retailers
- [ ] Push notifications

### Phase 3
- [ ] Shop/guide partnerships
- [ ] Social features
- [ ] Personal analytics
- [ ] Fly box inventory

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | Expo / React Native |
| Navigation | Expo Router |
| State | Zustand |
| Backend | Supabase (Auth, Database, Storage) |
| AI | Claude API |
| Maps | Google Maps Platform |

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
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
npm run web      # Open in web browser
npm run android  # Open on Android device/emulator
npm run ios      # Open on iOS simulator (macOS only)
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Project Structure

```
HatchMatch/
├── docs/                    # Planning & documentation
│   ├── FEATURE_PLAN.md      # Feature breakdown
│   ├── ARCHITECTURE.md      # Technical architecture
│   └── TEST_PLAN.md         # Test cases
├── src/
│   ├── app/                 # Expo Router screens
│   │   ├── (tabs)/          # Tab navigation
│   │   ├── water/           # Water body screens
│   │   └── trip/            # Trip screens
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API & external services
│   ├── stores/              # Zustand state stores
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── supabase/
│   └── schema.sql           # Database schema
└── assets/                  # Images, icons, fonts
```

## Documentation

| Document | Description |
|----------|-------------|
| [Feature Plan](docs/FEATURE_PLAN.md) | Detailed feature breakdown and roadmap |
| [Architecture](docs/ARCHITECTURE.md) | Technical architecture and data model |
| [Test Plan](docs/TEST_PLAN.md) | Comprehensive test cases |

## Configuration

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Update credentials in `src/services/supabase.ts`

### Environment Variables (Future)

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Business Model

**Freemium** with optional premium subscription:

| Feature | Free | Premium |
|---------|------|---------|
| Fly recommendations | 1/day | Unlimited |
| Trip planning | 1 active | Unlimited |
| Offline mode | No | Yes |
| Auto-refresh | No | Yes |

**Pricing:** $4.99/month or $29.99/year

## Contributing

This project is currently in early development. Contributions welcome once we reach MVP.

## License

Private - All rights reserved.

---

*Built with ☕ and 🎣 for the fly fishing community*
