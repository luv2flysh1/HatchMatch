-- Add Montana fly shop sources for fishing reports
-- These cover popular Montana rivers including Bitterroot, Madison, Yellowstone, Missouri, Big Hole, etc.

-- Add last_successful_scrape column if it doesn't exist (used by scraping function)
ALTER TABLE public.fly_shop_sources
ADD COLUMN IF NOT EXISTS last_successful_scrape TIMESTAMPTZ;

-- Missoulian Angler (Missoula, MT) - Covers western Montana rivers
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Missoulian Angler', 'https://www.missoulianangler.com', 'https://www.missoulianangler.com/fishing-reports/', 'MT',
  ARRAY['Bitterroot River', 'Blackfoot River', 'Clark Fork River', 'Rock Creek', 'Missouri River'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Missoulian Angler');

-- Grizzly Hackle (Missoula, MT) - Another great western Montana source
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Grizzly Hackle Fly Shop', 'https://grizzlyhackle.com', 'https://grizzlyhackle.com/fishing-reports/', 'MT',
  ARRAY['Bitterroot River', 'Blackfoot River', 'Clark Fork River', 'Rock Creek'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Grizzly Hackle Fly Shop');

-- Blue Ribbon Flies (West Yellowstone, MT) - Madison, Yellowstone, Henry's Fork
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Blue Ribbon Flies', 'https://blueribbonflies.com', 'https://blueribbonflies.com/fishing-reports/', 'MT',
  ARRAY['Madison River', 'Yellowstone River', 'Henry''s Fork', 'Firehole River', 'Gibbon River', 'Gallatin River'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Blue Ribbon Flies');

-- Headhunters Fly Shop (Craig, MT) - Missouri River specialists
-- Update existing entry to add more water coverage
UPDATE public.fly_shop_sources
SET waters_covered = ARRAY['Missouri River', 'Blackfoot River', 'Big Hole River', 'Dearborn River', 'Sun River']
WHERE name = 'Headhunters Fly Shop';

-- If Headhunters doesn't exist, insert it
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Headhunters Fly Shop', 'https://headhuntersflyshop.com', 'https://headhuntersflyshop.com/pages/fishing-report', 'MT',
  ARRAY['Missouri River', 'Blackfoot River', 'Big Hole River', 'Dearborn River', 'Sun River'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Headhunters Fly Shop');

-- Montana Troutfitters (Bozeman, MT) - Gallatin Valley rivers
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Montana Troutfitters', 'https://troutfitters.com', 'https://troutfitters.com/fly-fishing-reports/', 'MT',
  ARRAY['Gallatin River', 'Madison River', 'Yellowstone River', 'Missouri River', 'Boulder River'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Montana Troutfitters');

-- Gallatin River Guides (Big Sky, MT) - Gallatin River specialists
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Gallatin River Guides', 'https://gallatinriverguides.com', 'https://gallatinriverguides.com/fly-fishing-reports/', 'MT',
  ARRAY['Gallatin River', 'Madison River', 'Yellowstone River'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Gallatin River Guides');

-- The Rivers Edge (Bozeman, MT) - Covers many SW Montana rivers
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'The Rivers Edge', 'https://theriversedge.com', 'https://theriversedge.com/fishing-reports/', 'MT',
  ARRAY['Madison River', 'Gallatin River', 'Yellowstone River', 'Missouri River', 'Big Hole River', 'Beaverhead River'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'The Rivers Edge');

-- Frontier Anglers (Dillon, MT) - Big Hole and Beaverhead specialists
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Frontier Anglers', 'https://frontieranglers.com', 'https://frontieranglers.com/fishing-report/', 'MT',
  ARRAY['Big Hole River', 'Beaverhead River', 'Ruby River', 'Jefferson River', 'Clark Canyon Reservoir'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Frontier Anglers');

-- Big Hole Lodge (Wise River, MT) - Big Hole River specialists
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Big Hole Lodge', 'https://bigholelodge.com', 'https://bigholelodge.com/big-hole-river-fishing-report/', 'MT',
  ARRAY['Big Hole River', 'Beaverhead River', 'Wise River'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Big Hole Lodge');

-- Parks Fly Shop (Gardiner, MT) - Yellowstone area
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Parks Fly Shop', 'https://parksflyshop.com', 'https://parksflyshop.com/fishing-reports/', 'MT',
  ARRAY['Yellowstone River', 'Gardner River', 'Lamar River', 'Slough Creek', 'Soda Butte Creek'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Parks Fly Shop');

-- Montana Fly Fishing Connection (Helena, MT)
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Montana Fly Fishing Connection', 'https://mtfly.com', 'https://mtfly.com/fishing-reports/', 'MT',
  ARRAY['Missouri River', 'Blackfoot River', 'Clark Fork River', 'Rock Creek', 'Big Hole River'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Montana Fly Fishing Connection');

-- Yellowstone Angler (Livingston, MT) - Lower Yellowstone area
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Yellowstone Angler', 'https://yellowstoneangler.com', 'https://yellowstoneangler.com/fishing-report/', 'MT',
  ARRAY['Yellowstone River', 'Paradise Valley Spring Creeks', 'Boulder River', 'Stillwater River', 'DePuy Spring Creek', 'Armstrong Spring Creek'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Yellowstone Angler');

-- Dan Bailey's Fly Shop (Livingston, MT) - Historic shop, Yellowstone area
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Dan Bailey''s Fly Shop', 'https://dan-bailey.com', 'https://dan-bailey.com/fishing-reports/', 'MT',
  ARRAY['Yellowstone River', 'Boulder River', 'Stillwater River', 'Madison River'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Dan Bailey''s Fly Shop');

-- Orvis - Montana general reports (covers multiple waters)
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Orvis Montana', 'https://fishingreports.orvis.com', 'https://fishingreports.orvis.com/mountain/montana', 'MT',
  ARRAY['Madison River', 'Missouri River', 'Yellowstone River', 'Gallatin River', 'Big Hole River', 'Bitterroot River', 'Blackfoot River', 'Clark Fork River'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Orvis Montana');

-- Add comment for documentation
COMMENT ON TABLE public.fly_shop_sources IS 'Fly shop websites to scrape for fishing reports. Montana sources added 2026-02-11.';
