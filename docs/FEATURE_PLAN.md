# HatchMatch - Feature Plan

> A mobile application that tells you which flies are working best on any river or lake in the world.

## Table of Contents

- [Overview](#overview)
- [Business Model](#business-model)
- [API Cost Estimates](#api-cost-estimates)
- [Core Features (MVP - Phase 1)](#core-features-mvp---phase-1)
- [Enhanced Features (Phase 2)](#enhanced-features-phase-2)
- [Future Features (Phase 3+)](#future-features-phase-3)
- [Development Plan](#development-plan)
- [Technical Decisions](#technical-decisions)

---

## Overview

**Platform:** iOS and Android (built with Expo/React Native)

**Geographic Scope:** US waters only for MVP, global expansion in later phase based on user feedback

**Species Support:** All species supported - recommendations will be strongest for trout initially (best hatch chart data available), quality for other species improves as user catch reports come in

**Core Value Proposition:** Help fly anglers know which flies to use at any water body, plan trips, and find nearby fly shops.

**Data Sources for Fly Recommendations:**
1. AI/ML predictions based on conditions (water temp, hatch charts, season, weather)
2. User-reported catch data and community reports
3. ✅ **Aggregated fishing reports from fly shops** (implemented - multi-source scraping with 14-day freshness filter)
4. Future: Direct partnerships with local fly shops and fishing guides

---

## Business Model

**Model:** Freemium with optional premium subscription

**Pricing:**
- Free tier: Core features with limits
- Premium: $4.99/month or $29.99/year (~50% annual discount)
- Alternative: Season pass $19.99 (Apr-Oct) for seasonal anglers

**Revenue Streams:**
1. Premium subscriptions
2. Affiliate commissions on fly purchases via retailer links
3. Future: Featured/sponsored fly shop listings

### Free vs Premium Features

| Feature | Free | Premium |
|---------|------|---------|
| Fly recommendations | 1 water body/day | Unlimited |
| Trip planning | 1 active trip | Unlimited trips |
| Fly shop locator | Full access | Full access |
| Catch reporting | Full access | Full access |
| Offline mode | No | Yes |
| Auto-refresh trips | No | Yes |
| Ad-free experience | No | Yes |
| Purchase links (affiliate) | Yes | Yes |

**Rationale:**
- Free tier is genuinely useful to build user base and goodwill
- Limits create natural friction for serious anglers who fish frequently
- Offline mode is high value for remote locations - strong upgrade motivator
- Catch reporting stays free to maximize community data collection
- Affiliate revenue supplements subscriptions on free tier

### API Cost Estimates

Fly recommendations are powered by Claude AI. Here are the estimated costs:

**Claude API Pricing:**

| Model | Input | Output |
|-------|-------|--------|
| Claude Sonnet 4 | $3 / 1M tokens | $15 / 1M tokens |
| Claude Haiku 3.5 | $0.80 / 1M tokens | $4 / 1M tokens |

**Per-Request Estimate:**
- Input: ~1,500-2,500 tokens (water body, weather, hatch data, prompt)
- Output: ~500-800 tokens (5 fly recommendations with reasoning)

| Model | Cost per Request |
|-------|------------------|
| Sonnet 4 | ~$0.015 - $0.02 (1.5-2 cents) |
| Haiku 3.5 | ~$0.004 - $0.005 (0.4-0.5 cents) |

**Monthly Cost Projections (using Haiku):**

| Monthly Requests | Estimated Cost |
|------------------|----------------|
| 10,000 | $40 - $50 |
| 50,000 | $200 - $250 |
| 100,000 | $400 - $500 |

**Cost Optimization Strategies:**
1. Use Haiku for most requests (4x cheaper than Sonnet, sufficient quality)
2. Cache aggressively - same water + date returns cached result
3. Batch trip requests - one API call for multi-water trips
4. Set smart cache expiry - 12-24 hours unless conditions change significantly

---

## Core Features (MVP - Phase 1)

### 1. User Authentication
- Sign up / Sign in (email + password)
- Optional: Social login (Google, Apple)
- User profile with preferences:
  - Home location
  - Skill level
  - Favorite species

### 2. Water Body Search & Discovery
- Search by name (river/lake) + location (state, city)
- Search nearby using GPS
- View water body details:
  - Type (river, lake, stream)
  - Species present
  - Access points
- Save favorites / bookmarked locations

### 3. Fly Recommendations Engine
AI-generated recommendations based on:
- Season and time of year
- General hatch charts for the region
- Weather conditions (current + forecast)
- Water type (river vs lake, freestone vs tailwater)
- Target species
- ✅ **Real-time fly shop fishing reports** (aggregated from multiple sources)

Display for each recommended fly:
- Fly name and image
- Size range
- Confidence level / reasoning
- Technique tips (dry, nymph, streamer, etc.)

#### ✅ Fishing Report Integration (Implemented)
Before fly recommendations, display current fishing report summary:
- Source attribution (single shop or "N fly shops")
- Effectiveness notes from local experts
- Hot flies currently working
- Water conditions (temp, clarity, level)
- Report freshness indicator (only shows reports < 14 days old)

Features:
- Dynamic fly shop discovery using Claude AI
- Multi-source aggregation for comprehensive intel
- 3-day caching to reduce API calls
- Automatic filtering of outdated reports

### 4. Single Trip Planning
- Create a trip with:
  - Date(s)
  - Single water body OR multiple water bodies
  - Notes field
- View fly recommendations for that trip
- Trip summary screen

### 5. Fly Shop Locator
- Find fly shops near a water body or along a route
- Shop details (address, phone, hours, website)
- "Get Directions" button → opens native maps app (Google Maps, Apple Maps, Waze)
- Distance from current location or trip destination

---

## Enhanced Features (Phase 2)

### 6. Multi-Trip Management
- Save multiple future trips
- Auto-refresh recommendations on app open
- Trip list view with quick status
- Edit / delete trips

### 7. User Catch Reporting
- Log a catch:
  - Location
  - Fly used
  - Conditions
  - Photo (optional)
- Rate fly effectiveness (1-5)
- Public vs private reports
- View community reports for a water body

### 8. Offline Mode
- Download trip data for offline access
- Cache fly recommendations and shop info
- Sync when back online

### 9. Purchase Integration
- Link to online retailers for each fly
- "Buy this fly" deep links to major retailers
- Price comparison (stretch goal)

### 10. Push Notifications
- Trip reminders
- "Conditions changed" alerts for saved trips
- New reports for favorited waters

---

## Future Features (Phase 3+)

### 11. Guide/Shop Partnerships
- Verified shop accounts
- Real-time "what's working" updates from shops
- Featured shops / sponsored content

### 12. Social Features
- Follow other anglers
- Share trips and catches
- Leaderboards (optional)

### 13. Advanced Analytics
- Personal catch history and trends
- Best conditions for your catches
- Species-specific insights

### 14. Gear Management
- Track your fly box inventory
- "You don't have this fly" alerts
- Restock reminders

---

## Development Plan

### Phase 1: MVP (Foundation)

#### Milestone 1.1 - Project Setup & Auth
- Initialize Expo project
- Set up navigation structure
- Implement authentication (Firebase Auth or Supabase)
- Basic user profile

#### Milestone 1.2 - Water Body Search
- Location services integration
- Search UI (nearby + manual search)
- Water body database integration
- Results list and detail views

#### Milestone 1.3 - Fly Recommendations
- Build recommendation engine (LLM integration + data sources)
- Fly detail display
- Recommendations by water body

#### Milestone 1.4 - Basic Trip Planning
- Create trip flow
- Single and multi-location trips
- Trip list view
- Trip detail with recommendations

#### Milestone 1.5 - Fly Shop Locator
- Shop search by location
- Google Places or similar integration
- Navigation deep linking

#### Milestone 1.6 - Polish & Launch Prep
- UI/UX refinement
- Error handling
- App store assets and submission

---

### Phase 2: Engagement & Retention

#### Milestone 2.1 - Multi-Trip & Auto-Refresh
- Trip management improvements
- Background refresh logic
- Trip notifications

#### Milestone 2.2 - Catch Reporting
- Catch logging UI
- Photo upload
- Community reports feed

#### Milestone 2.3 - Offline Support
- Data caching strategy
- Download for offline
- Sync mechanism

#### Milestone 2.4 - Purchase Links
- Retailer integration
- Affiliate tracking (if applicable)

---

### Phase 3: Growth & Monetization
- Shop partnerships program
- Premium features (if freemium model)
- Social features
- Advanced analytics

---

## Technical Decisions

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Framework | Expo (React Native) | Confirmed - cross-platform iOS/Android |
| Backend | Firebase, Supabase, Custom | Supabase - good balance of features and flexibility |
| Auth | Firebase Auth, Supabase Auth, Auth0 | Match backend choice |
| Database | Firestore, Supabase Postgres, PlanetScale | Supabase Postgres - relational fits this data well |
| Maps | Google Maps, Mapbox, Apple Maps | Google Maps - best coverage and Places API |
| AI/Recommendations | Claude API, OpenAI, custom ML | Claude API with structured prompts + hatch data |
| Water body data | Custom DB, USGS, Fishing APIs | Hybrid - USGS for rivers + custom curation |

---

## Open Questions

1. ~~Monetization model?~~ **Decided: Freemium** (see Business Model section)
2. ~~Geographic scope?~~ **Decided: US-only for MVP**, global expansion in later phase based on user feedback
3. ~~Species prioritization?~~ **Decided: All species supported** - no artificial limits, recommendations will be strongest for trout initially (best hatch chart data), quality for other species improves as user reports come in
4. ~~App name?~~ **Decided: HatchMatch**

---

*Document created: January 2026*
