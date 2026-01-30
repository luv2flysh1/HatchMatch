-- Clear all fishing reports and fly shop sources to start fresh
-- The scrape function will rediscover shops with validated URLs

TRUNCATE TABLE public.fishing_reports;
TRUNCATE TABLE public.fly_shop_sources CASCADE;
