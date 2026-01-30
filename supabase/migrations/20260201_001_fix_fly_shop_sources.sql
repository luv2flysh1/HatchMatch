-- Delete seeded fly shop sources with incorrect URLs
-- These will be re-discovered dynamically by the scrape function

DELETE FROM public.fly_shop_sources;

-- Add policy for service role to manage fly_shop_sources
CREATE POLICY "Service role can manage fly shop sources" ON public.fly_shop_sources
  FOR ALL USING (true) WITH CHECK (true);
