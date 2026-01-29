-- Additional Water Bodies Seed Data
-- Popular fly fishing destinations across the US

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description) VALUES
-- Montana
('Madison River', 'river', 'MT', 'Ennis', 45.3494, -111.7288, ARRAY['rainbow trout', 'brown trout'], 'Legendary freestone river with world-class dry fly fishing.'),
('Yellowstone River', 'river', 'MT', 'Livingston', 45.6619, -110.5600, ARRAY['cutthroat trout', 'rainbow trout', 'brown trout'], 'Longest undammed river in the lower 48, excellent summer fishing.'),
('Big Hole River', 'river', 'MT', 'Wise River', 45.7933, -113.4833, ARRAY['rainbow trout', 'brown trout', 'arctic grayling'], 'One of the last rivers with native arctic grayling.'),
('Missouri River', 'river', 'MT', 'Craig', 47.1786, -111.8608, ARRAY['rainbow trout', 'brown trout'], 'Prolific tailwater with incredible midge and mayfly hatches.'),
('Gallatin River', 'river', 'MT', 'Big Sky', 45.2836, -111.3000, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Beautiful mountain river featured in A River Runs Through It.'),
('Bighorn River', 'river', 'MT', 'Fort Smith', 45.3147, -107.9331, ARRAY['rainbow trout', 'brown trout'], 'World-renowned tailwater with trophy trout.'),

-- Wyoming
('North Platte River', 'river', 'WY', 'Saratoga', 41.4511, -106.8067, ARRAY['rainbow trout', 'brown trout'], 'Excellent tailwater sections with large trout.'),
('Green River', 'river', 'WY', 'Pinedale', 42.8661, -109.8614, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Remote freestone river with excellent hatches.'),
('Snake River', 'river', 'WY', 'Jackson', 43.4799, -110.7624, ARRAY['cutthroat trout', 'brown trout'], 'Scenic river in Grand Teton with native cutthroat.'),
('Firehole River', 'river', 'WY', 'Yellowstone', 44.6489, -110.8578, ARRAY['rainbow trout', 'brown trout'], 'Unique geothermally-heated river in Yellowstone.'),

-- Idaho
('Henry''s Fork', 'river', 'ID', 'Island Park', 44.4175, -111.3928, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Technical spring creek fishing at its finest.'),
('South Fork Boise River', 'river', 'ID', 'Boise', 43.4847, -115.6436, ARRAY['rainbow trout', 'brown trout'], 'Excellent tailwater close to Boise.'),
('Silver Creek', 'stream', 'ID', 'Picabo', 43.3075, -114.1417, ARRAY['rainbow trout', 'brown trout'], 'World-famous spring creek with challenging sight fishing.'),
('Salmon River', 'river', 'ID', 'Stanley', 44.2194, -114.9333, ARRAY['steelhead', 'chinook salmon', 'cutthroat trout'], 'The River of No Return with incredible steelhead runs.'),

-- Pennsylvania
('Penns Creek', 'river', 'PA', 'Mifflinburg', 40.9253, -77.1133, ARRAY['brown trout', 'rainbow trout'], 'Pennsylvania''s premier limestone creek with legendary green drake hatch.'),
('Little Juniata River', 'river', 'PA', 'Spruce Creek', 40.6275, -78.1372, ARRAY['brown trout', 'rainbow trout'], 'Beautiful limestone stream with excellent hatches.'),
('Spring Creek', 'stream', 'PA', 'Bellefonte', 40.9128, -77.7786, ARRAY['brown trout', 'rainbow trout'], 'Classic Pennsylvania limestone spring creek.'),
('Yellow Breeches Creek', 'stream', 'PA', 'Boiling Springs', 40.1492, -77.1292, ARRAY['brown trout', 'rainbow trout'], 'Limestone creek with year-round fishing near Harrisburg.'),

-- New York
('Delaware River', 'river', 'NY', 'Hancock', 41.9556, -75.2842, ARRAY['rainbow trout', 'brown trout'], 'East Coast''s premier wild trout fishery.'),
('Ausable River', 'river', 'NY', 'Wilmington', 44.3825, -73.8200, ARRAY['brown trout', 'rainbow trout', 'brook trout'], 'Beautiful Adirondack freestone river.'),
('Willowemoc Creek', 'stream', 'NY', 'Livingston Manor', 41.8981, -74.8233, ARRAY['brown trout', 'rainbow trout'], 'Historic Catskill stream, birthplace of American fly fishing.'),
('Beaverkill River', 'river', 'NY', 'Roscoe', 41.9350, -74.9083, ARRAY['brown trout', 'rainbow trout'], 'Legendary Catskill river with rich fly fishing history.'),

-- Vermont
('Battenkill River', 'river', 'VT', 'Manchester', 43.1589, -73.0708, ARRAY['brown trout', 'brook trout'], 'Classic New England freestone with wild trout.'),
('White River', 'river', 'VT', 'Bethel', 43.8350, -72.6344, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Vermont''s best trout river with excellent access.'),
('Mettawee River', 'river', 'VT', 'Pawlet', 43.3500, -73.1833, ARRAY['brown trout', 'brook trout'], 'Small freestone with wild trout populations.'),

-- California
('Fall River', 'river', 'CA', 'McArthur', 41.0456, -121.4228, ARRAY['rainbow trout', 'brown trout'], 'Spring-fed river with challenging sight fishing.'),
('Hot Creek', 'stream', 'CA', 'Mammoth Lakes', 37.6611, -118.8267, ARRAY['rainbow trout', 'brown trout'], 'World-class spring creek in the Eastern Sierra.'),
('Owens River', 'river', 'CA', 'Bishop', 37.3639, -118.3967, ARRAY['brown trout', 'rainbow trout'], 'Technical spring creek fishing with large fish.'),
('McCloud River', 'river', 'CA', 'McCloud', 41.2556, -122.1400, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Pristine freestone in the shadow of Mt. Shasta.'),
('Truckee River', 'river', 'CA', 'Truckee', 39.3278, -120.1833, ARRAY['rainbow trout', 'brown trout'], 'Lake Tahoe''s outlet with excellent urban fishing.'),

-- Oregon
('Deschutes River', 'river', 'OR', 'Maupin', 45.1756, -121.0833, ARRAY['rainbow trout', 'steelhead', 'brown trout'], 'High desert tailwater with legendary redsides.'),
('Metolius River', 'river', 'OR', 'Camp Sherman', 44.4606, -121.6344, ARRAY['rainbow trout', 'bull trout', 'brook trout'], 'Crystal-clear spring creek with trophy bull trout.'),
('McKenzie River', 'river', 'OR', 'Blue River', 44.1631, -122.3339, ARRAY['rainbow trout', 'cutthroat trout'], 'Beautiful freestone with native redsides.'),
('Crooked River', 'river', 'OR', 'Prineville', 44.3011, -120.8511, ARRAY['rainbow trout', 'brown trout'], 'Central Oregon tailwater with year-round fishing.'),

-- Washington
('Yakima River', 'river', 'WA', 'Ellensburg', 47.0025, -120.5478, ARRAY['rainbow trout', 'cutthroat trout'], 'Washington''s best wild trout river.'),
('Rocky Ford Creek', 'stream', 'WA', 'Ephrata', 47.3017, -119.4500, ARRAY['rainbow trout'], 'Selective gear spring creek with large rainbows.'),

-- Michigan
('Au Sable River', 'river', 'MI', 'Grayling', 44.6608, -84.7147, ARRAY['brown trout', 'brook trout', 'rainbow trout'], 'Historic Michigan river, birthplace of Trout Unlimited.'),
('Pere Marquette River', 'river', 'MI', 'Baldwin', 43.9011, -85.8517, ARRAY['brown trout', 'steelhead', 'salmon'], 'Excellent year-round fishing with steelhead and salmon runs.'),
('Manistee River', 'river', 'MI', 'Mesick', 44.4150, -85.7133, ARRAY['brown trout', 'rainbow trout', 'steelhead'], 'Large freestone with diverse fishing opportunities.'),

-- Arkansas
('White River', 'river', 'AR', 'Bull Shoals', 36.3833, -92.5833, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Legendary Southern tailwater with trophy browns.'),
('Little Red River', 'river', 'AR', 'Heber Springs', 35.5167, -91.9833, ARRAY['rainbow trout', 'brown trout'], 'World record brown trout water.'),
('Norfork River', 'river', 'AR', 'Norfork', 36.2119, -92.2167, ARRAY['rainbow trout', 'brown trout'], 'Small but productive tailwater.'),

-- New Mexico
('San Juan River', 'river', 'NM', 'Navajo Dam', 36.8058, -107.6500, ARRAY['rainbow trout', 'brown trout'], 'World-class tailwater with incredible numbers of large fish.'),
('Rio Grande', 'river', 'NM', 'Taos', 36.4072, -105.5733, ARRAY['brown trout', 'rainbow trout', 'cutthroat trout'], 'Remote canyon fishing with wild trout.'),

-- Tennessee
('South Holston River', 'river', 'TN', 'Bristol', 36.5486, -82.0619, ARRAY['rainbow trout', 'brown trout'], 'Excellent Southern tailwater with sulphur hatches.'),
('Clinch River', 'river', 'TN', 'Norris', 36.2153, -84.0672, ARRAY['rainbow trout', 'brown trout'], 'Quality tailwater below Norris Dam.'),

-- North Carolina
('Davidson River', 'river', 'NC', 'Brevard', 35.2808, -82.7856, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Mountain freestone in Pisgah National Forest.'),
('Nantahala River', 'river', 'NC', 'Bryson City', 35.3342, -83.6089, ARRAY['rainbow trout', 'brown trout'], 'Scenic river with delayed harvest sections.'),

-- Alaska
('Kenai River', 'river', 'AK', 'Cooper Landing', 60.4911, -149.8300, ARRAY['rainbow trout', 'king salmon', 'sockeye salmon', 'dolly varden'], 'World-famous salmon and rainbow trout fishing.'),
('Bristol Bay', 'river', 'AK', 'King Salmon', 58.6833, -156.6500, ARRAY['rainbow trout', 'arctic char', 'salmon', 'arctic grayling'], 'Remote wilderness fishing at its finest.'),

-- Virginia
('Jackson River', 'river', 'VA', 'Covington', 37.7942, -79.9939, ARRAY['rainbow trout', 'brown trout'], 'Virginia''s best tailwater fishery.'),
('Smith River', 'river', 'VA', 'Bassett', 36.7686, -79.9908, ARRAY['brown trout', 'rainbow trout'], 'Quality tailwater in Southern Virginia.'),

-- Utah
('Green River', 'river', 'UT', 'Dutch John', 40.9286, -109.4083, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Blue-ribbon tailwater below Flaming Gorge.'),
('Provo River', 'river', 'UT', 'Heber City', 40.5072, -111.4133, ARRAY['brown trout', 'rainbow trout'], 'Three distinct sections with excellent fishing.'),

-- Massachusetts
('Deerfield River', 'river', 'MA', 'Charlemont', 42.6286, -72.8708, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Best trout river in Massachusetts with tailwater section.'),
('Swift River', 'river', 'MA', 'Belchertown', 42.2797, -72.3461, ARRAY['rainbow trout', 'brown trout'], 'Year-round catch and release tailwater.'),

-- Connecticut
('Farmington River', 'river', 'CT', 'Pleasant Valley', 41.9419, -73.0056, ARRAY['brown trout', 'rainbow trout', 'atlantic salmon'], 'Premier Connecticut trout stream with wild fish.'),
('Housatonic River', 'river', 'CT', 'Cornwall', 41.8419, -73.3639, ARRAY['brown trout', 'rainbow trout'], 'Excellent freestone with trophy browns.'),

-- West Virginia
('Elk River', 'river', 'WV', 'Slatyfork', 38.4167, -80.0667, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Beautiful mountain freestone with native brookies.'),
('Cranberry River', 'river', 'WV', 'Richwood', 38.2167, -80.4833, ARRAY['brook trout', 'rainbow trout'], 'Remote wilderness stream in Monongahela NF.');
