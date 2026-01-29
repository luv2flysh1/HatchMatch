-- Migration: Add expanded water bodies across US
-- Run with: supabase db push

-- Insert water bodies (skip if already exists by name+state)
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
SELECT name, type::water_body_type, state, city, latitude::decimal, longitude::decimal, species, description FROM (VALUES
  -- MONTANA
  ('Madison River', 'river', 'MT', 'Ennis', 45.3494, -111.7288, ARRAY['rainbow trout', 'brown trout'], 'Legendary freestone river with world-class dry fly fishing.'),
  ('Yellowstone River', 'river', 'MT', 'Livingston', 45.6619, -110.5600, ARRAY['cutthroat trout', 'rainbow trout', 'brown trout'], 'Longest undammed river in the lower 48.'),
  ('Big Hole River', 'river', 'MT', 'Wise River', 45.7933, -113.4833, ARRAY['rainbow trout', 'brown trout', 'arctic grayling'], 'One of the last rivers with native arctic grayling.'),
  ('Missouri River', 'river', 'MT', 'Craig', 47.1786, -111.8608, ARRAY['rainbow trout', 'brown trout'], 'Prolific tailwater with incredible hatches.'),
  ('Gallatin River', 'river', 'MT', 'Big Sky', 45.2836, -111.3000, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Beautiful mountain river from A River Runs Through It.'),
  ('Bighorn River', 'river', 'MT', 'Fort Smith', 45.3147, -107.9331, ARRAY['rainbow trout', 'brown trout'], 'World-renowned tailwater with trophy trout.'),
  ('Rock Creek', 'river', 'MT', 'Clinton', 46.7667, -113.7167, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Classic Montana freestone near Missoula.'),
  ('Bitterroot River', 'river', 'MT', 'Hamilton', 46.2458, -114.1617, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Beautiful valley river with excellent access.'),
  ('Blackfoot River', 'river', 'MT', 'Missoula', 46.8833, -113.9833, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout', 'bull trout'], 'A River Runs Through It fame.'),

  -- WYOMING
  ('North Platte River', 'river', 'WY', 'Saratoga', 41.4511, -106.8067, ARRAY['rainbow trout', 'brown trout'], 'Excellent tailwater sections with large trout.'),
  ('Green River (WY)', 'river', 'WY', 'Pinedale', 42.8661, -109.8614, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Remote freestone river with excellent hatches.'),
  ('Snake River', 'river', 'WY', 'Jackson', 43.4799, -110.7624, ARRAY['cutthroat trout', 'brown trout'], 'Scenic river in Grand Teton with native cutthroat.'),
  ('Firehole River', 'river', 'WY', 'Yellowstone', 44.6489, -110.8578, ARRAY['rainbow trout', 'brown trout'], 'Unique geothermally-heated river in Yellowstone.'),
  ('Wind River', 'river', 'WY', 'Dubois', 43.5347, -109.6303, ARRAY['cutthroat trout', 'rainbow trout', 'brown trout'], 'Remote mountain river with wild fish.'),

  -- IDAHO
  ('Henry''s Fork', 'river', 'ID', 'Island Park', 44.4175, -111.3928, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Technical spring creek fishing at its finest.'),
  ('Silver Creek', 'stream', 'ID', 'Picabo', 43.3075, -114.1417, ARRAY['rainbow trout', 'brown trout'], 'World-famous spring creek with challenging sight fishing.'),
  ('Salmon River', 'river', 'ID', 'Stanley', 44.2194, -114.9333, ARRAY['steelhead', 'chinook salmon', 'cutthroat trout'], 'The River of No Return.'),
  ('South Fork Snake River', 'river', 'ID', 'Idaho Falls', 43.4917, -111.9833, ARRAY['cutthroat trout', 'brown trout', 'rainbow trout'], 'Blue-ribbon water with massive hatches.'),
  ('Big Wood River', 'river', 'ID', 'Ketchum', 43.6808, -114.3636, ARRAY['rainbow trout', 'brown trout'], 'Sun Valley area freestone.'),

  -- PENNSYLVANIA
  ('Penns Creek', 'river', 'PA', 'Mifflinburg', 40.9253, -77.1133, ARRAY['brown trout', 'rainbow trout'], 'Pennsylvania''s premier limestone creek with legendary green drake hatch.'),
  ('Little Juniata River', 'river', 'PA', 'Spruce Creek', 40.6275, -78.1372, ARRAY['brown trout', 'rainbow trout'], 'Beautiful limestone stream.'),
  ('Spring Creek', 'stream', 'PA', 'Bellefonte', 40.9128, -77.7786, ARRAY['brown trout', 'rainbow trout'], 'Classic Pennsylvania limestone spring creek.'),
  ('Yellow Breeches Creek', 'stream', 'PA', 'Boiling Springs', 40.1492, -77.1292, ARRAY['brown trout', 'rainbow trout'], 'Limestone creek near Harrisburg.'),
  ('Big Fishing Creek', 'creek', 'PA', 'Lamar', 41.0167, -77.4833, ARRAY['brown trout', 'rainbow trout'], 'Premier Pennsylvania limestone stream.'),

  -- NEW YORK
  ('Delaware River', 'river', 'NY', 'Hancock', 41.9556, -75.2842, ARRAY['rainbow trout', 'brown trout'], 'East Coast''s premier wild trout fishery.'),
  ('Ausable River', 'river', 'NY', 'Wilmington', 44.3825, -73.8200, ARRAY['brown trout', 'rainbow trout', 'brook trout'], 'Beautiful Adirondack freestone.'),
  ('Willowemoc Creek', 'stream', 'NY', 'Livingston Manor', 41.8981, -74.8233, ARRAY['brown trout', 'rainbow trout'], 'Birthplace of American fly fishing.'),
  ('Beaverkill River', 'river', 'NY', 'Roscoe', 41.9350, -74.9083, ARRAY['brown trout', 'rainbow trout'], 'Legendary Catskill river.'),

  -- CALIFORNIA
  ('Fall River', 'river', 'CA', 'McArthur', 41.0456, -121.4228, ARRAY['rainbow trout', 'brown trout'], 'Spring-fed river with challenging sight fishing.'),
  ('Hot Creek', 'stream', 'CA', 'Mammoth Lakes', 37.6611, -118.8267, ARRAY['rainbow trout', 'brown trout'], 'World-class spring creek in the Eastern Sierra.'),
  ('Owens River', 'river', 'CA', 'Bishop', 37.3639, -118.3967, ARRAY['brown trout', 'rainbow trout'], 'Technical spring creek with large fish.'),
  ('McCloud River', 'river', 'CA', 'McCloud', 41.2556, -122.1400, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Pristine freestone in the shadow of Mt. Shasta.'),
  ('Truckee River', 'river', 'CA', 'Truckee', 39.3278, -120.1833, ARRAY['rainbow trout', 'brown trout'], 'Lake Tahoe''s outlet.'),
  ('Hat Creek', 'creek', 'CA', 'Burney', 40.8833, -121.5333, ARRAY['rainbow trout', 'brown trout'], 'Wild trout section with technical fishing.'),

  -- OREGON
  ('Deschutes River', 'river', 'OR', 'Maupin', 45.1756, -121.0833, ARRAY['rainbow trout', 'steelhead', 'brown trout'], 'High desert tailwater with legendary redsides.'),
  ('Metolius River', 'river', 'OR', 'Camp Sherman', 44.4606, -121.6344, ARRAY['rainbow trout', 'bull trout', 'brook trout'], 'Crystal-clear spring creek.'),
  ('McKenzie River', 'river', 'OR', 'Blue River', 44.1631, -122.3339, ARRAY['rainbow trout', 'cutthroat trout'], 'Beautiful freestone with native redsides.'),
  ('Crooked River', 'river', 'OR', 'Prineville', 44.3011, -120.8511, ARRAY['rainbow trout', 'brown trout'], 'Central Oregon tailwater.'),
  ('North Umpqua River', 'river', 'OR', 'Roseburg', 43.2767, -123.3408, ARRAY['steelhead', 'rainbow trout', 'chinook salmon'], 'Legendary summer steelhead water.'),

  -- ARKANSAS
  ('White River', 'river', 'AR', 'Bull Shoals', 36.3833, -92.5833, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Legendary Southern tailwater with trophy browns.'),
  ('Little Red River', 'river', 'AR', 'Heber Springs', 35.5167, -91.9833, ARRAY['rainbow trout', 'brown trout'], 'World record brown trout water.'),
  ('Norfork River', 'river', 'AR', 'Norfork', 36.2119, -92.2167, ARRAY['rainbow trout', 'brown trout'], 'Small but productive tailwater.'),

  -- NEW MEXICO
  ('San Juan River', 'river', 'NM', 'Navajo Dam', 36.8058, -107.6500, ARRAY['rainbow trout', 'brown trout'], 'World-class tailwater with incredible numbers.'),
  ('Rio Grande', 'river', 'NM', 'Taos', 36.4072, -105.5733, ARRAY['brown trout', 'rainbow trout', 'cutthroat trout'], 'Remote canyon fishing.'),

  -- TENNESSEE
  ('South Holston River', 'river', 'TN', 'Bristol', 36.5486, -82.0619, ARRAY['rainbow trout', 'brown trout'], 'Excellent Southern tailwater.'),
  ('Clinch River', 'river', 'TN', 'Norris', 36.2153, -84.0672, ARRAY['rainbow trout', 'brown trout'], 'Quality tailwater below Norris Dam.'),

  -- NORTH CAROLINA
  ('Davidson River', 'river', 'NC', 'Brevard', 35.2808, -82.7856, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Mountain freestone in Pisgah NF.'),
  ('Nantahala River', 'river', 'NC', 'Bryson City', 35.3342, -83.6089, ARRAY['rainbow trout', 'brown trout'], 'Scenic river with delayed harvest.'),

  -- VIRGINIA
  ('Jackson River', 'river', 'VA', 'Covington', 37.7942, -79.9939, ARRAY['rainbow trout', 'brown trout'], 'Virginia''s best tailwater fishery.'),
  ('Smith River', 'river', 'VA', 'Bassett', 36.7686, -79.9908, ARRAY['brown trout', 'rainbow trout'], 'Quality tailwater in Southern Virginia.'),
  ('Mossy Creek', 'creek', 'VA', 'Bridgewater', 38.3833, -79.0000, ARRAY['brown trout', 'rainbow trout'], 'Trophy spring creek.'),

  -- UTAH
  ('Green River (UT)', 'river', 'UT', 'Dutch John', 40.9286, -109.4083, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Blue-ribbon tailwater below Flaming Gorge.'),
  ('Provo River', 'river', 'UT', 'Heber City', 40.5072, -111.4133, ARRAY['brown trout', 'rainbow trout'], 'Three distinct sections.'),
  ('Weber River', 'river', 'UT', 'Oakley', 40.7153, -111.2972, ARRAY['brown trout', 'rainbow trout'], 'Blue Ribbon fishery near Park City.'),

  -- MICHIGAN
  ('Au Sable River', 'river', 'MI', 'Grayling', 44.6608, -84.7147, ARRAY['brown trout', 'brook trout', 'rainbow trout'], 'Historic river, birthplace of Trout Unlimited.'),
  ('Pere Marquette River', 'river', 'MI', 'Baldwin', 43.9011, -85.8517, ARRAY['brown trout', 'steelhead', 'salmon'], 'Excellent year-round fishing.'),
  ('Manistee River', 'river', 'MI', 'Mesick', 44.4150, -85.7133, ARRAY['brown trout', 'rainbow trout', 'steelhead'], 'Large freestone with diverse opportunities.'),

  -- VERMONT
  ('Battenkill River', 'river', 'VT', 'Manchester', 43.1589, -73.0708, ARRAY['brown trout', 'brook trout'], 'Classic New England freestone.'),
  ('White River (VT)', 'river', 'VT', 'Bethel', 43.8350, -72.6344, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Vermont''s best trout river.'),

  -- CONNECTICUT
  ('Farmington River', 'river', 'CT', 'Pleasant Valley', 41.9419, -73.0056, ARRAY['brown trout', 'rainbow trout', 'atlantic salmon'], 'Premier Connecticut trout stream.'),
  ('Housatonic River', 'river', 'CT', 'Cornwall', 41.8419, -73.3639, ARRAY['brown trout', 'rainbow trout'], 'Excellent freestone with trophy browns.'),

  -- MASSACHUSETTS
  ('Deerfield River', 'river', 'MA', 'Charlemont', 42.6286, -72.8708, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Best trout river in Massachusetts.'),
  ('Swift River', 'river', 'MA', 'Belchertown', 42.2797, -72.3461, ARRAY['rainbow trout', 'brown trout'], 'Year-round catch and release tailwater.'),

  -- WEST VIRGINIA
  ('Elk River', 'river', 'WV', 'Slatyfork', 38.4167, -80.0667, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Mountain freestone with native brookies.'),
  ('Cranberry River', 'river', 'WV', 'Richwood', 38.2167, -80.4833, ARRAY['brook trout', 'rainbow trout'], 'Remote wilderness stream.'),

  -- WASHINGTON
  ('Yakima River', 'river', 'WA', 'Ellensburg', 47.0025, -120.5478, ARRAY['rainbow trout', 'cutthroat trout'], 'Washington''s best wild trout river.'),
  ('Rocky Ford Creek', 'stream', 'WA', 'Ephrata', 47.3017, -119.4500, ARRAY['rainbow trout'], 'Selective gear spring creek.'),

  -- GEORGIA
  ('Chattahoochee River', 'river', 'GA', 'Atlanta', 33.8792, -84.4561, ARRAY['rainbow trout', 'brown trout'], 'Urban tailwater with year-round fishing.'),
  ('Toccoa River', 'river', 'GA', 'Blue Ridge', 34.8642, -84.3242, ARRAY['rainbow trout', 'brown trout'], 'Quality tailwater in north Georgia.'),

  -- ARIZONA
  ('Lee''s Ferry', 'river', 'AZ', 'Marble Canyon', 36.8653, -111.5892, ARRAY['rainbow trout', 'brown trout'], 'World-class tailwater below Glen Canyon Dam.'),
  ('Oak Creek', 'creek', 'AZ', 'Sedona', 34.8697, -111.7608, ARRAY['rainbow trout', 'brown trout'], 'Desert creek through red rock country.'),

  -- MAINE
  ('Kennebec River', 'river', 'ME', 'The Forks', 45.3542, -69.9681, ARRAY['landlocked salmon', 'brook trout', 'brown trout'], 'Large river with landlocked salmon.'),
  ('Rapid River', 'river', 'ME', 'Upton', 44.8333, -70.8833, ARRAY['brook trout', 'landlocked salmon'], 'Remote stream with wild brook trout.'),

  -- ALASKA
  ('Kenai River', 'river', 'AK', 'Cooper Landing', 60.4911, -149.8300, ARRAY['rainbow trout', 'king salmon', 'sockeye salmon', 'dolly varden'], 'World-famous salmon and trout.'),
  ('Bristol Bay', 'river', 'AK', 'King Salmon', 58.6833, -156.6500, ARRAY['rainbow trout', 'arctic char', 'salmon', 'arctic grayling'], 'Remote wilderness fishing.')
) AS v(name, type, state, city, latitude, longitude, species, description)
WHERE NOT EXISTS (SELECT 1 FROM public.water_bodies w WHERE w.name = v.name AND w.state = v.state);
