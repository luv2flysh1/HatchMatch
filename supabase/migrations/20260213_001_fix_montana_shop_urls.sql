-- Fix Montana fly shop URLs that are returning 404 errors
-- Many shops need www prefix and correct paths

-- Blue Ribbon Flies - change from /fishing-reports/ to /fishing-report/
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.blueribbonflies.com/fishing-report/',
    website = 'https://www.blueribbonflies.com',
    is_active = true,
    consecutive_failures = 0
WHERE name = 'Blue Ribbon Flies';

-- Headhunters Fly Shop - uses blog for reports, needs www
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.headhuntersflyshop.com/blog/',
    website = 'https://www.headhuntersflyshop.com',
    is_active = true,
    consecutive_failures = 0
WHERE name = 'Headhunters Fly Shop';

-- The Rivers Edge - fix URL
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.theriversedge.com/pages/fishing-reports',
    website = 'https://www.theriversedge.com',
    is_active = true,
    consecutive_failures = 0
WHERE name = 'The Rivers Edge';

-- Yellowstone Angler - has SSL issues, try alternative
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.yellowstoneangler.com/category/fishing-report/',
    website = 'https://www.yellowstoneangler.com',
    is_active = true,
    consecutive_failures = 0
WHERE name = 'Yellowstone Angler';

-- Montana Troutfitters - fix URL
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.troutfitters.com/fishing-reports/',
    website = 'https://www.troutfitters.com',
    is_active = true,
    consecutive_failures = 0
WHERE name = 'Montana Troutfitters';

-- Grizzly Hackle - add www
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.grizzlyhackle.com/fishing-reports/',
    website = 'https://www.grizzlyhackle.com',
    is_active = true,
    consecutive_failures = 0
WHERE name LIKE 'Grizzly Hackle%';

-- Missoulian Angler - add www
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.missoulianangler.com/fishing-reports/',
    website = 'https://www.missoulianangler.com',
    is_active = true,
    consecutive_failures = 0
WHERE name = 'Missoulian Angler';

-- Frontier Anglers - add www
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.frontieranglers.com/fishing-report/',
    website = 'https://www.frontieranglers.com',
    is_active = true,
    consecutive_failures = 0
WHERE name = 'Frontier Anglers';

-- Parks Fly Shop - add www
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.parksflyshop.com/fishing-reports/',
    website = 'https://www.parksflyshop.com',
    is_active = true,
    consecutive_failures = 0
WHERE name = 'Parks Fly Shop';

-- Gallatin River Guides - add www
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.gallatinriverguides.com/fly-fishing-reports/',
    website = 'https://www.gallatinriverguides.com',
    is_active = true,
    consecutive_failures = 0
WHERE name = 'Gallatin River Guides';

-- Dan Bailey's - add www
UPDATE public.fly_shop_sources
SET reports_url = 'https://www.dan-bailey.com/fishing-reports/',
    website = 'https://www.dan-bailey.com',
    is_active = true,
    consecutive_failures = 0
WHERE name LIKE 'Dan Bailey%';

-- Clear any stale fishing report caches for Montana waters
DELETE FROM public.fishing_reports
WHERE water_body_name ILIKE '%madison%'
   OR water_body_name ILIKE '%yellowstone%'
   OR water_body_name ILIKE '%gallatin%'
   OR water_body_name ILIKE '%missouri%'
   OR water_body_name ILIKE '%bitterroot%'
   OR water_body_name ILIKE '%big hole%'
   OR water_body_name ILIKE '%blackfoot%';
