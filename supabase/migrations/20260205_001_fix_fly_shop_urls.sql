-- Fix fly shop source URLs to point to actual current reports pages
-- Remove shops with outdated/generic URLs and add better ones

-- Remove Worley Bugger (2019 URL - very outdated)
DELETE FROM public.fly_shop_sources WHERE name = 'Worley Bugger Fly Co';

-- Remove Avid Angler (profile page, not current reports)
DELETE FROM public.fly_shop_sources WHERE name = 'Avid Angler';

-- Remove Orvis (aggregator with potentially stale data)
DELETE FROM public.fly_shop_sources WHERE name = 'Orvis Fishing Reports';

-- Update Reds Fly Shop URL to their blog which has dated reports
UPDATE public.fly_shop_sources
SET reports_url = 'https://redsflyfishing.com/blogs/yakima-river-fishing-report'
WHERE name = 'Reds Fly Shop';

-- Add Rocky Ford Creek coverage to Reds (they report on it)
UPDATE public.fly_shop_sources
SET waters_covered = ARRAY['Yakima River', 'Rocky Ford Creek', 'Naches River', 'Cle Elum River']
WHERE name = 'Reds Fly Shop';

-- Add Blue Dun Fly Shop for Rocky Ford Creek (they specialize in it)
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered)
SELECT 'Blue Dun Fly Shop', 'https://bluedunflyshop.com', 'https://bluedunflyshop.com/fishing-reports', 'WA', ARRAY['Rocky Ford Creek', 'Dry Falls Lake']
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Blue Dun Fly Shop');

-- Clear any cached reports so fresh scraping happens
DELETE FROM public.fishing_reports WHERE water_body_name IN ('Yakima River', 'Rocky Ford Creek');
