-- Migration: Allow inserts to water_bodies table
-- This enables users to add water bodies from external sources (USGS)

-- Allow anyone to insert water bodies
CREATE POLICY "Anyone can insert water bodies" ON public.water_bodies
  FOR INSERT WITH CHECK (true);

-- Note: In a production app, you might want to restrict this to authenticated users:
-- CREATE POLICY "Authenticated users can insert water bodies" ON public.water_bodies
--   FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
