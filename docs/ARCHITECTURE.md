# HatchMatch - Application Architecture & Data Model

## Table of Contents

- [High-Level Overview](#high-level-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [External Services](#external-services)
- [API Cost Estimates](#api-cost-estimates)
- [Data Flow](#data-flow)
- [Data Model](#data-model)
- [Table Definitions](#table-definitions)

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP                                │
│                    (Expo / React Native)                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │  Search   │ │   Trips   │ │   Shops   │ │  Profile  │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Supabase)                          │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │   Auth    │ │ Database  │ │  Storage  │ │Edge Funcs │       │
│  │           │ │ (Postgres)│ │  (Photos) │ │   (API)   │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │ Claude AI │ │  Weather  │ │Google Maps│ │   USGS    │       │
│  │   (Recs)  │ │    API    │ │ Places API│ │(Water Data│       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Mobile App | Expo (React Native) | Cross-platform iOS/Android |
| Navigation | Expo Router | File-based routing |
| State Management | Zustand | Lightweight state management |
| Backend | Supabase | Auth, Database, Storage, Edge Functions |
| Database | PostgreSQL | Relational data storage |
| AI | Claude API | Fly recommendations |
| Maps | Google Maps Platform | Places API, navigation |
| Weather | OpenWeather API | Current conditions and forecast |
| Water Data | USGS Water Services | River flow rates, water temp |

---

## Frontend Architecture

### Directory Structure

```
src/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/             # Auth screens (login, signup)
│   ├── (tabs)/             # Main tab navigation
│   │   ├── index.tsx       # Home / Search
│   │   ├── trips.tsx       # Trip list
│   │   ├── shops.tsx       # Fly shop finder
│   │   └── profile.tsx     # User profile & settings
│   ├── water/[id].tsx      # Water body detail
│   ├── trip/[id].tsx       # Trip detail
│   └── _layout.tsx         # Root layout
│
├── components/             # Reusable UI components
│   ├── ui/                 # Basic components (Button, Card, Input)
│   ├── water/              # Water body components
│   ├── fly/                # Fly display components
│   ├── trip/               # Trip components
│   └── shop/               # Shop components
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useWaterBodies.ts
│   ├── useTrips.ts
│   ├── useRecommendations.ts
│   └── useLocation.ts
│
├── services/               # API and external service calls
│   ├── supabase.ts         # Supabase client
│   ├── recommendations.ts  # AI recommendation calls
│   ├── weather.ts          # Weather API
│   └── maps.ts             # Google Maps/Places
│
├── stores/                 # State management (Zustand)
│   ├── authStore.ts
│   ├── tripStore.ts
│   └── settingsStore.ts
│
├── types/                  # TypeScript types
│   └── index.ts
│
└── utils/                  # Utility functions
    ├── formatting.ts
    └── location.ts
```

### Key Libraries

| Library | Purpose |
|---------|---------|
| expo | Core framework |
| expo-router | File-based navigation |
| expo-location | GPS access |
| @supabase/supabase-js | Backend client |
| zustand | State management |
| react-native-maps | Map display |
| expo-linking | Deep linking to maps apps |
| expo-secure-store | Secure token storage |
| expo-notifications | Push notifications (Phase 2) |

---

## Backend Architecture

### Supabase Services

**Authentication**
- Email/password signup and login
- Social auth (Google, Apple Sign-In)
- JWT tokens managed automatically
- Row Level Security (RLS) for data access

**Database (PostgreSQL)**
- All application data
- PostGIS extension for geospatial queries
- RLS policies for user data isolation
- Indexes for search performance

**Storage**
- Catch report photos
- Fly pattern images
- Organized by buckets with access policies

**Edge Functions (Deno)**
- Serverless API endpoints
- Claude API integration
- External service orchestration

### Edge Functions

```
supabase/functions/
├── get-recommendations/    # AI fly recommendations
│   └── index.ts
├── search-water-bodies/    # Geospatial + text search
│   └── index.ts
├── refresh-trip-data/      # Bulk refresh for premium users
│   └── index.ts
└── process-catch-report/   # Validate and store catch data
    └── index.ts
```

### Row Level Security (RLS) Policies

| Table | Policy | Rule |
|-------|--------|------|
| users | Users can read/update own profile | `auth.uid() = id` |
| trips | Users can CRUD own trips | `auth.uid() = user_id` |
| catch_reports | Users can CRUD own reports | `auth.uid() = user_id` |
| catch_reports | Anyone can read public reports | `is_public = true` |
| favorites | Users can CRUD own favorites | `auth.uid() = user_id` |
| water_bodies | Anyone can read | `true` |
| flies | Anyone can read | `true` |
| fly_shops | Anyone can read | `true` |

---

## External Services

### Claude API (Anthropic)

**Purpose:** Generate intelligent fly recommendations

**Integration:**
- Called via Supabase Edge Function
- Structured prompt with context (water, weather, hatch data)
- Returns JSON with fly recommendations
- Response cached to reduce API calls

**Prompt Context Includes:**
- Water body details (type, species, region)
- Current weather and 3-day forecast
- Seasonal hatch chart data
- Recent community catch reports
- Water conditions (flow rate, temp if available)

**API Cost Estimates:**

| Model | Input Cost | Output Cost |
|-------|------------|-------------|
| Claude Sonnet 4 | $3 / 1M tokens | $15 / 1M tokens |
| Claude Haiku 3.5 | $0.80 / 1M tokens | $4 / 1M tokens |

Typical request size:
- Input: ~1,500-2,500 tokens
- Output: ~500-800 tokens

Cost per recommendation request:
- Sonnet 4: ~$0.015 - $0.02 (1.5-2 cents)
- Haiku 3.5: ~$0.004 - $0.005 (0.4-0.5 cents) **← Recommended**

Monthly projections (using Haiku):
| Requests/Month | Estimated Cost |
|----------------|----------------|
| 10,000 | $40 - $50 |
| 50,000 | $200 - $250 |
| 100,000 | $400 - $500 |

**Cost Optimization Strategies:**
1. Use Haiku for most requests (4x cheaper, sufficient quality for structured recommendations)
2. Aggressive caching - same water body + date returns cached result
3. Batch requests for multi-water trips into single API call
4. Smart cache expiry (12-24 hours unless conditions change significantly)

### Weather API (OpenWeather)

**Purpose:** Current conditions and forecast

**Data Used:**
- Temperature (air)
- Cloud cover
- Precipitation
- Wind speed
- 3-day forecast for trip planning

### Google Maps Platform

**Services Used:**
- Places API - Fly shop search
- Place Details - Shop info (hours, phone, etc.)
- Directions URL scheme - Hand off to maps app

### USGS Water Services

**Purpose:** Real-time water conditions

**Data Used:**
- Stream flow rate (CFS)
- Water temperature (where available)
- Historical data for context

**Note:** Not all water bodies have USGS monitoring sites. Data availability varies.

---

## Data Flow

### Getting Fly Recommendations

```
1. User opens water body detail screen
                    │
                    ▼
2. App checks recommendation_cache
   ├── If valid cache exists → Display cached recommendations
   └── If no cache or expired → Continue to step 3
                    │
                    ▼
3. App calls Edge Function: get-recommendations
   POST /functions/v1/get-recommendations
   Body: { water_body_id, date }
                    │
                    ▼
4. Edge Function gathers context (parallel calls):
   ├── Water body info from database
   ├── Weather API → current + forecast
   ├── USGS API → flow rate, water temp
   ├── Hatch chart data from database
   └── Recent catch reports from database
                    │
                    ▼
5. Edge Function builds Claude prompt with all context
                    │
                    ▼
6. Claude API returns structured recommendations (JSON):
   {
     "recommendations": [
       {
         "fly_id": "uuid",
         "fly_name": "Parachute Adams",
         "confidence": 0.85,
         "reasoning": "PMD hatch expected...",
         "size": "16-18",
         "technique": "dead drift"
       },
       ...
     ],
     "conditions_summary": "..."
   }
                    │
                    ▼
7. Edge Function caches result in recommendation_cache
                    │
                    ▼
8. App displays recommendations to user
```

### Trip Auto-Refresh (Premium)

```
1. Premium user opens app
                    │
                    ▼
2. App checks for trips with auto_refresh = true
                    │
                    ▼
3. For each trip, check if recommendations are stale
   (older than 24 hours or conditions changed significantly)
                    │
                    ▼
4. Call refresh-trip-data Edge Function
   (batches multiple water bodies efficiently)
                    │
                    ▼
5. Update local cache and UI
```

---

## Data Model

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │    trips     │       │ trip_waters  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │──────<│ id (PK)      │──────<│ trip_id (FK) │
│ email        │       │ user_id (FK) │       │ water_id (FK)│
│ name         │       │ name         │       │ order        │
│ home_lat     │       │ start_date   │       └──────────────┘
│ home_lng     │       │ end_date     │              │
│ skill_level  │       │ notes        │              │
│ tier         │       │ created_at   │              ▼
└──────────────┘       └──────────────┘       ┌──────────────┐
       │                                       │ water_bodies │
       │                                       ├──────────────┤
       │       ┌──────────────┐               │ id (PK)      │
       │       │catch_reports │               │ name         │
       │       ├──────────────┤               │ type         │
       └──────>│ id (PK)      │──────────────>│ state        │
               │ user_id (FK) │               │ city         │
               │ water_id (FK)│               │ latitude     │
               │ fly_id (FK)  │               │ longitude    │
               │ caught_at    │               │ species      │
               │ rating       │               └──────────────┘
               │ photo_url    │                      │
               │ conditions   │                      │
               │ is_public    │                      ▼
               └──────────────┘               ┌──────────────┐
                      │                       │    flies     │
                      │                       ├──────────────┤
                      └──────────────────────>│ id (PK)      │
                                              │ name         │
┌──────────────┐       ┌──────────────┐       │ type         │
│  fly_shops   │       │  favorites   │       │ sizes        │
├──────────────┤       ├──────────────┤       │ image_url    │
│ id (PK)      │       │ user_id (FK) │       │ description  │
│ name         │       │ water_id (FK)│       └──────────────┘
│ address      │       │ created_at   │
│ city         │       └──────────────┘       ┌──────────────┐
│ state        │                              │ hatch_charts │
│ latitude     │       ┌──────────────┐       ├──────────────┤
│ longitude    │       │subscriptions │       │ id (PK)      │
│ phone        │       ├──────────────┤       │ region       │
│ website      │       │ id (PK)      │       │ month        │
│ hours        │       │ user_id (FK) │       │ insect_name  │
│ place_id     │       │ tier         │       │ fly_patterns │
└──────────────┘       │ started_at   │       │ time_of_day  │
                       │ expires_at   │       └──────────────┘
                       │ stripe_id    │
                       └──────────────┘

┌──────────────────┐
│recommendation_   │
│     cache        │
├──────────────────┤
│ id (PK)          │
│ water_body_id(FK)│
│ date             │
│ recommendations  │
│ conditions       │
│ expires_at       │
└──────────────────┘
```

---

## Table Definitions

### users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Supabase auth user ID |
| email | varchar(255) | NOT NULL, UNIQUE | User email |
| name | varchar(100) | | Display name |
| home_latitude | decimal(10,7) | | Home location for "nearby" |
| home_longitude | decimal(10,7) | | Home location for "nearby" |
| skill_level | enum | DEFAULT 'beginner' | beginner, intermediate, advanced |
| tier | enum | DEFAULT 'free' | free, premium |
| created_at | timestamptz | DEFAULT now() | Account creation |
| updated_at | timestamptz | DEFAULT now() | Last update |

### water_bodies

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| name | varchar(200) | NOT NULL | River/lake name |
| type | enum | NOT NULL | river, lake, stream, creek, pond |
| state | varchar(2) | NOT NULL | US state abbreviation |
| city | varchar(100) | | Nearest city |
| latitude | decimal(10,7) | NOT NULL | Center point |
| longitude | decimal(10,7) | NOT NULL | Center point |
| species | text[] | DEFAULT '{}' | Array of species present |
| usgs_site_id | varchar(20) | | USGS monitoring site ID |
| description | text | | General info about the water |
| created_at | timestamptz | DEFAULT now() | Record creation |

**Indexes:**
- `idx_water_bodies_location` - GiST index on (latitude, longitude) for geo queries
- `idx_water_bodies_state` - B-tree on state
- `idx_water_bodies_name` - GIN index for text search

### flies

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| name | varchar(100) | NOT NULL | Fly pattern name |
| type | enum | NOT NULL | dry, nymph, streamer, wet, emerger |
| sizes | varchar(20) | | Common sizes (e.g., "14-18") |
| image_url | varchar(500) | | Photo of the fly |
| description | text | | When/how to use |
| species_targets | text[] | DEFAULT '{}' | Species this fly targets |
| created_at | timestamptz | DEFAULT now() | Record creation |

### trips

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | uuid | FK → users.id, NOT NULL | Owner of the trip |
| name | varchar(100) | NOT NULL | Trip name |
| start_date | date | NOT NULL | Trip start |
| end_date | date | | Trip end (nullable for day trips) |
| notes | text | | User notes |
| auto_refresh | boolean | DEFAULT false | Premium: refresh on app open |
| created_at | timestamptz | DEFAULT now() | Record creation |
| updated_at | timestamptz | DEFAULT now() | Last update |

**Indexes:**
- `idx_trips_user_id` - B-tree on user_id
- `idx_trips_start_date` - B-tree on start_date

### trip_waters

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| trip_id | uuid | FK → trips.id, NOT NULL | Trip reference |
| water_body_id | uuid | FK → water_bodies.id, NOT NULL | Water body reference |
| order | int | DEFAULT 0 | Order in itinerary |

**Constraints:**
- UNIQUE (trip_id, water_body_id)

### catch_reports

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | uuid | FK → users.id, NOT NULL | Reporter |
| water_body_id | uuid | FK → water_bodies.id, NOT NULL | Where caught |
| fly_id | uuid | FK → flies.id, NOT NULL | What fly worked |
| caught_at | timestamptz | NOT NULL | When caught |
| effectiveness | int | CHECK (1-5) | 1-5 rating |
| conditions | jsonb | | Weather, water conditions snapshot |
| photo_url | varchar(500) | | Optional photo (Supabase Storage) |
| is_public | boolean | DEFAULT true | Show in community reports |
| notes | text | | Optional notes |
| created_at | timestamptz | DEFAULT now() | Record creation |

**Indexes:**
- `idx_catch_reports_water_body` - B-tree on water_body_id
- `idx_catch_reports_caught_at` - B-tree on caught_at
- `idx_catch_reports_public` - Partial index WHERE is_public = true

### favorites

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | uuid | FK → users.id, NOT NULL | User |
| water_body_id | uuid | FK → water_bodies.id, NOT NULL | Favorited water |
| created_at | timestamptz | DEFAULT now() | When favorited |

**Constraints:**
- PK (user_id, water_body_id)

### subscriptions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | uuid | FK → users.id, NOT NULL | Subscriber |
| tier | enum | NOT NULL | premium, season_pass |
| started_at | timestamptz | NOT NULL | Subscription start |
| expires_at | timestamptz | NOT NULL | Subscription end |
| stripe_subscription_id | varchar(100) | | Stripe reference |
| created_at | timestamptz | DEFAULT now() | Record creation |

**Indexes:**
- `idx_subscriptions_user_id` - B-tree on user_id
- `idx_subscriptions_expires_at` - B-tree on expires_at

### fly_shops

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| name | varchar(200) | NOT NULL | Shop name |
| address | varchar(300) | | Street address |
| city | varchar(100) | NOT NULL | City |
| state | varchar(2) | NOT NULL | State |
| latitude | decimal(10,7) | NOT NULL | Location |
| longitude | decimal(10,7) | NOT NULL | Location |
| phone | varchar(20) | | Phone number |
| website | varchar(500) | | Website URL |
| hours | jsonb | | Operating hours by day |
| google_place_id | varchar(100) | | For Google Maps integration |
| created_at | timestamptz | DEFAULT now() | Record creation |

**Indexes:**
- `idx_fly_shops_location` - GiST index for geo queries

### hatch_charts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| region | varchar(100) | NOT NULL | Geographic region |
| month | int | NOT NULL, CHECK (1-12) | Month |
| insect_name | varchar(100) | NOT NULL | Insect species |
| insect_type | enum | NOT NULL | mayfly, caddis, stonefly, midge, terrestrial |
| fly_patterns | text[] | DEFAULT '{}' | Matching fly patterns |
| time_of_day | varchar(50) | | When hatch occurs |
| water_types | text[] | DEFAULT '{}' | river, lake, etc. |

**Indexes:**
- `idx_hatch_charts_region_month` - B-tree on (region, month)

### recommendation_cache

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| water_body_id | uuid | FK → water_bodies.id, NOT NULL | Water body |
| date | date | NOT NULL | Recommendation date |
| recommendations | jsonb | NOT NULL | Cached AI response |
| conditions_snapshot | jsonb | | Conditions at generation time |
| created_at | timestamptz | DEFAULT now() | Cache creation |
| expires_at | timestamptz | NOT NULL | When to refresh |

**Constraints:**
- UNIQUE (water_body_id, date)

**Indexes:**
- `idx_recommendation_cache_expires` - B-tree on expires_at for cleanup

---

## Enum Definitions

```sql
CREATE TYPE water_body_type AS ENUM ('river', 'lake', 'stream', 'creek', 'pond');
CREATE TYPE fly_type AS ENUM ('dry', 'nymph', 'streamer', 'wet', 'emerger');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE user_tier AS ENUM ('free', 'premium');
CREATE TYPE subscription_tier AS ENUM ('premium', 'season_pass');
CREATE TYPE insect_type AS ENUM ('mayfly', 'caddis', 'stonefly', 'midge', 'terrestrial');
```

---

*Document created: January 2026*
