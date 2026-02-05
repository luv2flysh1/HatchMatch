# HatchMatch Demo Readiness Checklist

## Critical (Must Fix Before Demo)

- [x] **Onboarding reset loop** - Removed `RESET_ONBOARDING_ONCE` flag from `src/app/index.tsx` that was resetting onboarding on every launch
- [x] **Shops tab crash** - Rewrote `src/app/(tabs)/shops.tsx` to query `fly_shops` table directly instead of calling non-existent edge function; graceful "coming soon" messaging when no shops found
- [x] **Profile menu dead ends** - Added "Coming Soon" alerts to My Favorites, Catch Reports, Settings, and Upgrade to Premium menu items in `src/app/(tabs)/profile.tsx`
- [x] **Welcome screen images** - All 4 background images exist in `assets/images/` and `USE_BACKGROUND_IMAGES` is set to `true`

## Functional Testing (Verify Before Demo)

- [ ] **Auth flow** - Sign up, sign in, sign out, password reset all work
- [ ] **Water search** - Search by name returns results, search by state works
- [ ] **Water detail** - USGS conditions load, recommendations generate, fishing reports display
- [ ] **Trip CRUD** - Create, edit, delete trips; add/remove waters; trip list shows correctly
- [ ] **Trip recommendations** - "Get Fly Recommendations" generates aggregated fly selection across trip waters
- [ ] **Fly box** - Add flies from recommendations, view fly box tab, remove flies
- [ ] **Shops** - "Find Fly Shops Near Me" works with location permission (returns results if shops exist in DB)
- [ ] **Onboarding** - Welcome slides display correctly with images, "Don't show again" persists

## Known Limitations (Acceptable for Demo)

- Shops database may be sparse - only WA fly shops are seeded; shows graceful "coming soon" message for areas without coverage
- Fishing reports depend on fly shop websites being scrapable (many use JavaScript rendering)
- Recommendation quality depends on USGS data availability for the selected water body
- No offline mode - requires internet connection
- No push notifications
- Profile menu items (Favorites, Catch Reports, Settings, Premium) show "Coming Soon" alerts

## Database/Backend Dependencies

- [ ] Verify Supabase edge functions are deployed: `get-recommendations`, `scrape-fishing-report`
- [ ] Verify `fly_shops` table has seed data for demo area
- [ ] Verify `water_bodies` table has data for demo waters
- [ ] Verify RLS policies are active on `trips` and `trip_waters` tables
- [ ] Verify `trip_waters` table has UPDATE RLS policy (needed for reorder functionality)

## Build & Distribution

- [ ] Run `npx tsc --noEmit` - zero TypeScript errors
- [ ] Run `npx jest` - all tests passing
- [ ] EAS build for iOS/Android (or Expo Go for quick sharing)
- [ ] Test on physical device (not just simulator)
