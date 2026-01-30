-- Remove Silver Bow Fly Shop (discovered with wrong reports URL)
DELETE FROM public.fly_shop_sources WHERE name = 'Silver Bow Fly Shop';

-- Also clean up any cached reports from bad sources
DELETE FROM public.fishing_reports WHERE source_name = 'Silver Bow Fly Shop';
