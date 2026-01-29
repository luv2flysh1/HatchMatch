# HatchMatch - Comprehensive Test Plan

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Testing Tools](#testing-tools)
- [Test Categories](#test-categories)
- [Phase 1: MVP Tests](#phase-1-mvp-tests)
- [Phase 2: Enhanced Feature Tests](#phase-2-enhanced-feature-tests)
- [Phase 3: Future Feature Tests](#phase-3-future-feature-tests)
- [Test Coverage Goals](#test-coverage-goals)
- [Continuous Integration](#continuous-integration)

---

## Testing Strategy

### Testing Pyramid

```
         /\
        /  \        E2E Tests (10%)
       /----\       - Critical user flows
      /      \      - Cross-feature integration
     /--------\
    /          \    Integration Tests (20%)
   /  Component  \  - API calls
  /    Tests      \ - Database operations
 /----------------\ - Service interactions
/                  \
/    Unit Tests     \ Unit Tests (70%)
/    (Foundation)    \ - Stores, utilities, helpers
/----------------------\ - Pure functions
```

### Test-Driven Development (TDD) Approach

For each new feature:
1. Write failing tests first (Red)
2. Implement minimum code to pass (Green)
3. Refactor while keeping tests green (Refactor)

---

## Testing Tools

| Tool | Purpose | Status |
|------|---------|--------|
| Jest | Unit & integration test runner | ✅ Configured |
| ts-jest | TypeScript support for Jest | ✅ Configured |
| @testing-library/react-native | Component testing | ✅ Installed |
| MSW (Mock Service Worker) | API mocking | ✅ Installed |
| Maestro | E2E testing (future) | Planned |

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## Test Categories

### 1. Unit Tests
- **Location:** `src/__tests__/utils/`, `src/__tests__/stores/`
- **Focus:** Pure functions, state management logic
- **Mocking:** External dependencies fully mocked

### 2. Integration Tests
- **Location:** `src/__tests__/services/`, `src/__tests__/integration/`
- **Focus:** Service layer, API interactions
- **Mocking:** Network requests mocked, real logic executed

### 3. Component Tests
- **Location:** `src/__tests__/screens/`, `src/__tests__/components/`
- **Focus:** UI rendering, user interactions
- **Mocking:** Stores and services mocked
- **Note:** Currently limited due to Expo SDK 54 compatibility; will expand when resolved

### 4. E2E Tests
- **Location:** `e2e/` (future)
- **Focus:** Full user flows across screens
- **Tool:** Maestro (planned)

---

## Phase 1: MVP Tests

### 1.1 User Authentication

#### Unit Tests: `src/__tests__/stores/authStore.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `initial state` | Store initializes with null user, profile, session | ✅ Pass |
| `signUp - success` | Creates user, sets session, fetches profile | ✅ Pass |
| `signUp - duplicate email` | Returns appropriate error | ✅ Pass |
| `signIn - success` | Authenticates user, sets session | ✅ Pass |
| `signIn - invalid credentials` | Returns error, state unchanged | ✅ Pass |
| `signOut` | Clears user, profile, session | ✅ Pass |
| `fetchProfile` | Fetches profile when logged in | ✅ Pass |
| `fetchProfile - not logged in` | Does nothing when no user | ✅ Pass |
| `updateProfile` | Updates profile successfully | ✅ Pass |
| `updateProfile - not authenticated` | Returns error | ✅ Pass |
| `isLoading state` | Loading true during async operations | ✅ Pass |

#### Unit Tests: `src/__tests__/utils/validation.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `isValidEmail - valid` | Returns true for valid emails | ✅ Pass |
| `isValidEmail - invalid` | Returns false for invalid formats | ✅ Pass |
| `isValidPassword - valid` | Returns true for 6+ characters | ✅ Pass |
| `isValidPassword - short` | Returns false for < 6 characters | ✅ Pass |

#### Integration Tests: `src/__tests__/services/auth.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `signUp flow` | Full signup with profile creation | ⬜ TODO |
| `signIn flow` | Full signin with session persistence | ⬜ TODO |
| `session persistence` | Session restored on app restart | ⬜ TODO |
| `token refresh` | Auto-refresh of expired tokens | ⬜ TODO |

#### E2E Scenarios

| Scenario | Steps | Status |
|----------|-------|--------|
| New user signup | 1. Open app → 2. Go to Profile → 3. Tap Sign Up → 4. Enter email/password → 5. Verify profile shown | ⬜ TODO |
| Existing user login | 1. Open app → 2. Go to Profile → 3. Enter credentials → 4. Verify profile shown | ⬜ TODO |
| Logout | 1. Login → 2. Tap Sign Out → 3. Verify login form shown | ⬜ TODO |

---

### 1.2 Water Body Search & Discovery

#### Unit Tests: `src/__tests__/stores/waterStore.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `searchByName` | Searches water bodies by name | ⬜ TODO |
| `searchByName - partial match` | Returns partial name matches | ⬜ TODO |
| `searchByName - no results` | Returns empty array | ⬜ TODO |
| `searchNearby` | Returns waters within radius | ⬜ TODO |
| `searchNearby - no location` | Handles missing GPS gracefully | ⬜ TODO |
| `getWaterBody` | Fetches single water body by ID | ⬜ TODO |
| `toggleFavorite` | Adds/removes from favorites | ⬜ TODO |
| `getFavorites` | Returns user's favorited waters | ⬜ TODO |

#### Unit Tests: `src/__tests__/utils/location.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `calculateDistance` | Calculates distance between coordinates | ✅ Pass |
| `formatDistance` | Formats miles appropriately | ✅ Pass |
| `isWithinRadius` | Checks if point within radius | ⬜ TODO |
| `sortByDistance` | Sorts locations by distance | ⬜ TODO |

#### Integration Tests: `src/__tests__/services/waterBodies.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `search with filters` | Combines name, state, type filters | ⬜ TODO |
| `pagination` | Handles large result sets | ⬜ TODO |
| `caching` | Caches recent searches | ⬜ TODO |

#### E2E Scenarios

| Scenario | Steps | Status |
|----------|-------|--------|
| Search by name | 1. Enter "South Platte" → 2. Verify results appear → 3. Tap result → 4. Verify detail screen | ⬜ TODO |
| Find nearby | 1. Tap "Find Near Me" → 2. Allow location → 3. Verify waters sorted by distance | ⬜ TODO |
| Save favorite | 1. View water body → 2. Tap favorite → 3. Go to favorites → 4. Verify water listed | ⬜ TODO |

---

### 1.3 Fly Recommendations Engine

#### Unit Tests: `src/__tests__/stores/recommendationStore.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `getRecommendations` | Fetches recommendations for water body | ⬜ TODO |
| `getRecommendations - cached` | Returns cached if not expired | ⬜ TODO |
| `getRecommendations - expired cache` | Fetches new if cache expired | ⬜ TODO |
| `recommendation structure` | Validates recommendation format | ⬜ TODO |

#### Unit Tests: `src/__tests__/utils/recommendations.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `sortByConfidence` | Sorts recommendations by confidence | ⬜ TODO |
| `filterByType` | Filters by fly type (dry, nymph, etc.) | ⬜ TODO |
| `formatConfidence` | Formats confidence as percentage | ⬜ TODO |

#### Integration Tests: `src/__tests__/services/recommendations.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `API call structure` | Sends correct context to Claude API | ⬜ TODO |
| `response parsing` | Parses Claude response correctly | ⬜ TODO |
| `error handling` | Handles API errors gracefully | ⬜ TODO |
| `caching behavior` | Caches and retrieves properly | ⬜ TODO |

#### E2E Scenarios

| Scenario | Steps | Status |
|----------|-------|--------|
| View recommendations | 1. Search water → 2. Tap result → 3. Verify fly recommendations shown with confidence | ⬜ TODO |
| Recommendation details | 1. View recommendations → 2. Verify each has name, size, reasoning, technique | ⬜ TODO |

---

### 1.4 Trip Planning

#### Unit Tests: `src/__tests__/stores/tripStore.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `createTrip` | Creates new trip with required fields | ⬜ TODO |
| `createTrip - validation` | Rejects invalid dates, empty name | ⬜ TODO |
| `getTrips` | Returns user's trips | ⬜ TODO |
| `getTrip` | Returns single trip with waters | ⬜ TODO |
| `updateTrip` | Updates trip fields | ⬜ TODO |
| `deleteTrip` | Deletes trip and associated waters | ⬜ TODO |
| `addWaterToTrip` | Adds water body to trip | ⬜ TODO |
| `removeWaterFromTrip` | Removes water from trip | ⬜ TODO |
| `reorderTripWaters` | Changes water order in trip | ⬜ TODO |

#### Unit Tests: `src/__tests__/utils/trips.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `formatDateRange` | Formats trip date range | ⬜ TODO |
| `isUpcoming` | Identifies future trips | ⬜ TODO |
| `isPast` | Identifies past trips | ⬜ TODO |
| `getDaysUntil` | Calculates days until trip | ⬜ TODO |

#### Integration Tests: `src/__tests__/services/trips.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `create with multiple waters` | Creates trip with waters in order | ⬜ TODO |
| `cascade delete` | Deleting trip removes trip_waters | ⬜ TODO |
| `RLS policies` | User can only access own trips | ⬜ TODO |

#### E2E Scenarios

| Scenario | Steps | Status |
|----------|-------|--------|
| Create trip | 1. Tap "Plan New Trip" → 2. Enter name, dates → 3. Add water → 4. Save → 5. Verify in trip list | ⬜ TODO |
| View trip | 1. Open trip → 2. Verify waters listed → 3. Verify recommendations available | ⬜ TODO |
| Delete trip | 1. Open trip → 2. Delete → 3. Verify removed from list | ⬜ TODO |

---

### 1.5 Fly Shop Locator

#### Unit Tests: `src/__tests__/stores/shopStore.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `searchNearby` | Finds shops near coordinates | ⬜ TODO |
| `searchNearWater` | Finds shops near water body | ⬜ TODO |
| `getShopDetails` | Returns full shop info | ⬜ TODO |

#### Unit Tests: `src/__tests__/utils/shops.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `formatHours` | Formats operating hours | ⬜ TODO |
| `isCurrentlyOpen` | Checks if shop is open now | ⬜ TODO |
| `getDirectionsUrl` | Generates correct maps URL | ⬜ TODO |

#### Integration Tests: `src/__tests__/services/shops.test.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| `Google Places integration` | Fetches shop data correctly | ⬜ TODO |
| `directions deep link` | Opens correct maps app | ⬜ TODO |

#### E2E Scenarios

| Scenario | Steps | Status |
|----------|-------|--------|
| Find shops | 1. Go to Shops tab → 2. Allow location → 3. Verify shops listed with distance | ⬜ TODO |
| Get directions | 1. View shop → 2. Tap "Get Directions" → 3. Verify maps app opens | ⬜ TODO |

---

## Phase 2: Enhanced Feature Tests

### 2.1 Multi-Trip Management

| Test Case | Description | Status |
|-----------|-------------|--------|
| `list multiple trips` | Shows all user trips | ⬜ TODO |
| `sort trips by date` | Orders trips by start date | ⬜ TODO |
| `auto-refresh on open` | Premium trips refresh recommendations | ⬜ TODO |
| `refresh indicator` | Shows when data was last updated | ⬜ TODO |

### 2.2 Catch Reporting

| Test Case | Description | Status |
|-----------|-------------|--------|
| `create catch report` | Logs catch with required fields | ⬜ TODO |
| `upload photo` | Attaches photo to report | ⬜ TODO |
| `set public/private` | Toggles report visibility | ⬜ TODO |
| `view community reports` | Shows public reports for water | ⬜ TODO |
| `report improves recommendations` | Catch data influences AI | ⬜ TODO |

### 2.3 Offline Mode

| Test Case | Description | Status |
|-----------|-------------|--------|
| `download trip data` | Caches all trip info locally | ⬜ TODO |
| `view offline` | Displays cached data without network | ⬜ TODO |
| `offline indicator` | Shows when viewing cached data | ⬜ TODO |
| `sync on reconnect` | Uploads pending changes | ⬜ TODO |

### 2.4 Purchase Integration

| Test Case | Description | Status |
|-----------|-------------|--------|
| `retailer link` | Opens correct retailer URL | ⬜ TODO |
| `affiliate tracking` | Includes affiliate parameters | ⬜ TODO |
| `multiple retailers` | Shows options when available | ⬜ TODO |

### 2.5 Push Notifications

| Test Case | Description | Status |
|-----------|-------------|--------|
| `trip reminder` | Sends notification before trip | ⬜ TODO |
| `conditions alert` | Notifies when conditions change | ⬜ TODO |
| `notification permissions` | Handles permission request | ⬜ TODO |
| `notification settings` | Respects user preferences | ⬜ TODO |

---

## Phase 3: Future Feature Tests

### 3.1 Shop Partnerships

| Test Case | Description | Status |
|-----------|-------------|--------|
| `verified shop badge` | Shows verification status | ⬜ TODO |
| `real-time updates` | Displays shop-provided recommendations | ⬜ TODO |
| `featured placement` | Sponsored shops appear prominently | ⬜ TODO |

### 3.2 Social Features

| Test Case | Description | Status |
|-----------|-------------|--------|
| `follow angler` | Adds user to following list | ⬜ TODO |
| `share trip` | Generates shareable trip link | ⬜ TODO |
| `share catch` | Posts catch to followers | ⬜ TODO |

### 3.3 Advanced Analytics

| Test Case | Description | Status |
|-----------|-------------|--------|
| `catch history` | Shows all user catches | ⬜ TODO |
| `success patterns` | Identifies best conditions | ⬜ TODO |
| `species breakdown` | Groups catches by species | ⬜ TODO |

### 3.4 Gear Management

| Test Case | Description | Status |
|-----------|-------------|--------|
| `add to fly box` | Tracks owned flies | ⬜ TODO |
| `missing fly alert` | Warns when recommended fly not owned | ⬜ TODO |
| `restock reminder` | Suggests flies running low | ⬜ TODO |

---

## Test Coverage Goals

### Minimum Coverage Requirements

| Category | Target | Current |
|----------|--------|---------|
| Unit Tests | 80% | ~60% |
| Integration Tests | 60% | ~10% |
| E2E Critical Paths | 100% | 0% |

### Critical Paths Requiring E2E Coverage

1. **New User Onboarding:** Signup → Search → View Recommendations
2. **Trip Planning Flow:** Create Trip → Add Waters → View Recommendations
3. **Core Value Loop:** Search → Recommendations → Plan Trip → Fish → Report Catch
4. **Premium Upgrade:** Hit free limit → Shown upgrade → Complete purchase

---

## Continuous Integration

### GitHub Actions Workflow (Future)

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

### Pre-commit Hooks (Future)

```bash
# Run tests before commit
npm test -- --onlyChanged
```

---

## Test Data Management

### Mock Data Location

- `src/__tests__/mocks/supabase.ts` - Mock users, profiles, water bodies, flies
- `src/__tests__/mocks/api.ts` - Mock API responses

### Database Seeding

- Development: Uses seed data from `supabase/schema.sql`
- Testing: Uses in-memory mocks (no real database calls)

---

## Appendix: Test File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Unit test | `*.test.ts` | `validation.test.ts` |
| Integration test | `*.integration.test.ts` | `auth.integration.test.ts` |
| Component test | `*.test.tsx` | `ProfileScreen.test.tsx` |
| E2E test | `*.e2e.ts` | `onboarding.e2e.ts` |

---

*Document created: January 2026*
*Last updated: January 2026*
