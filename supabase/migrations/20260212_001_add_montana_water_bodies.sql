-- Add additional Montana water bodies that may be covered by the new fly shop sources
-- These are rivers not already in the database

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
SELECT name, type::water_body_type, state, city, latitude::decimal, longitude::decimal, species, description FROM (VALUES
  -- Additional Montana Rivers
  ('Clark Fork River', 'river', 'MT', 'Missoula', 46.8722, -114.0092, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Large river running through Missoula with excellent access.'),
  ('Beaverhead River', 'river', 'MT', 'Dillon', 45.2167, -112.6333, ARRAY['brown trout', 'rainbow trout'], 'Blue-ribbon tailwater known for large brown trout.'),
  ('Ruby River', 'river', 'MT', 'Sheridan', 45.4656, -112.1958, ARRAY['rainbow trout', 'brown trout'], 'Small freestone with good hatches.'),
  ('Jefferson River', 'river', 'MT', 'Twin Bridges', 45.5472, -112.3292, ARRAY['rainbow trout', 'brown trout'], 'Formed by the confluence of Beaverhead and Big Hole.'),
  ('Boulder River', 'river', 'MT', 'Big Timber', 45.8347, -110.2606, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Scenic freestone south of Big Timber.'),
  ('Stillwater River', 'river', 'MT', 'Absarokee', 45.5211, -109.4403, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Beautiful mountain freestone near Absarokee.'),
  ('Gardner River', 'river', 'MT', 'Gardiner', 45.0333, -110.7000, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Tributary to Yellowstone near Gardiner.'),
  ('Lamar River', 'river', 'MT', 'Yellowstone NP', 44.9031, -110.2078, ARRAY['cutthroat trout', 'rainbow trout'], 'Remote river in Yellowstone National Park with native cutthroat.'),
  ('Slough Creek', 'creek', 'MT', 'Yellowstone NP', 44.9411, -110.3347, ARRAY['cutthroat trout'], 'Meadow creek in Yellowstone known for large native cutthroat.'),
  ('Firehole River', 'river', 'MT', 'Yellowstone NP', 44.6489, -110.8578, ARRAY['rainbow trout', 'brown trout'], 'Geothermally-warmed river in Yellowstone.'),
  ('Gibbon River', 'river', 'MT', 'Yellowstone NP', 44.6617, -110.7333, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Scenic river through Yellowstone meadows.'),
  ('Dearborn River', 'river', 'MT', 'Augusta', 47.2833, -112.2000, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Wild river flowing from the Rocky Mountain Front.'),
  ('Sun River', 'river', 'MT', 'Augusta', 47.4878, -112.3922, ARRAY['rainbow trout', 'brown trout'], 'Scenic river below Gibson Dam.'),
  ('DePuy Spring Creek', 'creek', 'MT', 'Livingston', 45.5167, -110.4833, ARRAY['brown trout', 'rainbow trout'], 'Private spring creek, permit required.'),
  ('Armstrong Spring Creek', 'creek', 'MT', 'Livingston', 45.5194, -110.4728, ARRAY['brown trout', 'rainbow trout'], 'Private spring creek in Paradise Valley.'),
  ('Wise River', 'river', 'MT', 'Wise River', 45.8167, -112.9500, ARRAY['rainbow trout', 'brook trout', 'arctic grayling'], 'Small tributary to the Big Hole River.'),
  ('Clark Canyon Reservoir', 'lake', 'MT', 'Dillon', 44.9167, -112.8500, ARRAY['rainbow trout', 'brown trout'], 'Reservoir below Beaverhead River headwaters.')
) AS v(name, type, state, city, latitude, longitude, species, description)
WHERE NOT EXISTS (SELECT 1 FROM public.water_bodies w WHERE w.name = v.name AND w.state = v.state);

-- Add comment for documentation
COMMENT ON TABLE public.water_bodies IS 'Water bodies for fly fishing recommendations. Montana waters expanded 2026-02-11.';
