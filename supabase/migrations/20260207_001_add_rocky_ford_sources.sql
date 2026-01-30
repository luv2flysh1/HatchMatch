-- Add Rocky Ford Creek specific fly shop sources

-- Re-add Worley Bugger with correct Rocky Ford URL (they specialize in this creek)
INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered, is_active)
SELECT 'Worley Bugger Fly Co', 'http://www.worleybuggerflyco.com', 'http://www.worleybuggerflyco.com/rocky_ford_creek_report.htm', 'WA', ARRAY['Rocky Ford Creek', 'Desert Creek'], true
WHERE NOT EXISTS (SELECT 1 FROM public.fly_shop_sources WHERE name = 'Worley Bugger Fly Co' AND reports_url LIKE '%rocky_ford%');

-- Clear any stale Rocky Ford reports
DELETE FROM public.fishing_reports WHERE water_body_name = 'Rocky Ford Creek';
