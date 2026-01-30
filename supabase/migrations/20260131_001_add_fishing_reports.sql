-- Migration: Add fishing_reports table for cached scraped reports
-- Data expires after 3 days and is re-scraped on demand

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fishing Reports from external sources (fly shops, etc.)
CREATE TABLE IF NOT EXISTS public.fishing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  water_body_id UUID REFERENCES public.water_bodies(id) ON DELETE CASCADE,
  water_body_name VARCHAR(200), -- For matching when water_body_id not known
  source_name VARCHAR(200) NOT NULL, -- e.g., "Trout's Fly Fishing"
  source_url VARCHAR(500) NOT NULL,
  report_date DATE, -- Date the report covers (if known)
  report_text TEXT, -- Raw scraped content
  extracted_flies TEXT[], -- Fly patterns mentioned
  extracted_conditions JSONB, -- Weather, water conditions, etc.
  effectiveness_notes TEXT, -- Key takeaways about what's working
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- scraped_at + 3 days
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick cache lookups
CREATE INDEX idx_fishing_reports_water_body ON public.fishing_reports(water_body_id);
CREATE INDEX idx_fishing_reports_expires ON public.fishing_reports(expires_at);
CREATE INDEX idx_fishing_reports_water_name ON public.fishing_reports(water_body_name);

-- Enable RLS
ALTER TABLE public.fishing_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can read fishing reports
CREATE POLICY "Anyone can view fishing reports" ON public.fishing_reports
  FOR SELECT USING (true);

-- Fly shop sources reference table
CREATE TABLE IF NOT EXISTS public.fly_shop_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  website VARCHAR(500) NOT NULL,
  reports_url VARCHAR(500) NOT NULL, -- URL to their fishing reports page
  state VARCHAR(2) NOT NULL, -- Primary state they cover
  waters_covered TEXT[], -- Water body names they report on
  scrape_selector VARCHAR(200), -- CSS selector for report content (optional)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fly_shop_sources ENABLE ROW LEVEL SECURITY;

-- Anyone can read fly shop sources
CREATE POLICY "Anyone can view fly shop sources" ON public.fly_shop_sources
  FOR SELECT USING (true);

-- Seed initial fly shop sources
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered) VALUES
  ('Trouts Fly Fishing', 'https://troutsflyfishing.com', 'https://troutsflyfishing.com/pages/fishing-reports', 'CO',
   ARRAY['South Platte River', 'Cheesman Canyon', 'Deckers', 'Eleven Mile Canyon', 'Dream Stream']),
  ('Frying Pan Anglers', 'https://fryingpananglers.com', 'https://fryingpananglers.com/fishing-reports/', 'CO',
   ARRAY['Fryingpan River', 'Roaring Fork River', 'Crystal River']),
  ('Headhunters Fly Shop', 'https://headhuntersflyshop.com', 'https://headhuntersflyshop.com/pages/fishing-report', 'MT',
   ARRAY['Missouri River', 'Blackfoot River', 'Big Hole River']),
  ('Reds Fly Shop', 'https://redsflyfishing.com', 'https://redsflyfishing.com/pages/fishing-reports', 'WA',
   ARRAY['Yakima River', 'Rocky Ford Creek', 'Columbia River']),
  ('TCO Fly Shop', 'https://tcoflyfishing.com', 'https://tcoflyfishing.com/fishing-reports/', 'PA',
   ARRAY['Penns Creek', 'Spring Creek', 'Little Juniata River', 'Spruce Creek']);

COMMENT ON TABLE public.fishing_reports IS 'Cached fishing reports scraped from fly shops';
COMMENT ON TABLE public.fly_shop_sources IS 'Fly shop websites to scrape for fishing reports';
