-- Expanded Water Bodies Seed Data
-- Comprehensive US fly fishing destinations

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description) VALUES

-- ALABAMA
('Sipsey Fork', 'river', 'AL', 'Double Springs', 34.1456, -87.4167, ARRAY['rainbow trout', 'brown trout'], 'Alabama''s best tailwater trout fishery below Lewis Smith Dam.'),
('Little River Canyon', 'river', 'AL', 'Fort Payne', 34.3756, -85.6267, ARRAY['rainbow trout', 'spotted bass'], 'Scenic canyon river with stocked trout and native bass.'),

-- ARIZONA
('Lee''s Ferry', 'river', 'AZ', 'Marble Canyon', 36.8653, -111.5892, ARRAY['rainbow trout', 'brown trout'], 'World-class tailwater below Glen Canyon Dam on the Colorado River.'),
('Oak Creek', 'creek', 'AZ', 'Sedona', 34.8697, -111.7608, ARRAY['rainbow trout', 'brown trout'], 'Beautiful desert creek flowing through red rock country.'),
('Silver Creek', 'creek', 'AZ', 'Show Low', 34.1142, -109.9631, ARRAY['apache trout', 'rainbow trout'], 'Native Apache trout recovery stream.'),

-- CALIFORNIA (additional)
('Hat Creek', 'creek', 'CA', 'Burney', 40.8833, -121.5333, ARRAY['rainbow trout', 'brown trout'], 'Wild trout section with technical spring creek fishing.'),
('Upper Sacramento River', 'river', 'CA', 'Dunsmuir', 41.2083, -122.2717, ARRAY['rainbow trout', 'brown trout'], 'Freestone river recovering from chemical spill, now excellent.'),
('Lower Yuba River', 'river', 'CA', 'Marysville', 39.2167, -121.5500, ARRAY['rainbow trout', 'steelhead', 'shad'], 'Diverse fishery with resident and anadromous fish.'),
('Pit River', 'river', 'CA', 'Fall River Mills', 41.0000, -121.4333, ARRAY['rainbow trout', 'brown trout'], 'Challenging wading but excellent wild trout.'),
('East Walker River', 'river', 'CA', 'Bridgeport', 38.2556, -119.2283, ARRAY['brown trout', 'rainbow trout'], 'Trophy brown trout water in the Eastern Sierra.'),

-- COLORADO (additional)
('Williams Fork River', 'river', 'CO', 'Parshall', 40.0447, -106.1897, ARRAY['rainbow trout', 'brown trout'], 'Small tailwater with excellent dry fly fishing.'),
('Taylor River', 'river', 'CO', 'Almont', 38.6647, -106.8456, ARRAY['rainbow trout', 'brown trout'], 'Tailwater below Taylor Reservoir with large fish.'),
('Rio Grande', 'river', 'CO', 'South Fork', 37.6711, -106.6419, ARRAY['rainbow trout', 'brown trout'], 'Gold Medal water in southern Colorado.'),
('Lake Fork of the Gunnison', 'river', 'CO', 'Lake City', 38.0300, -107.3172, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Remote mountain river with wild trout.'),
('Animas River', 'river', 'CO', 'Durango', 37.2753, -107.8800, ARRAY['rainbow trout', 'brown trout'], 'Gold Medal urban fishery through historic Durango.'),

-- FLORIDA
('Everglades', 'lake', 'FL', 'Everglades City', 25.8578, -81.3856, ARRAY['tarpon', 'snook', 'redfish'], 'World-class saltwater flats fishing.'),
('Biscayne Bay', 'lake', 'FL', 'Miami', 25.5500, -80.2167, ARRAY['bonefish', 'permit', 'tarpon'], 'Urban flats with all three species of the grand slam.'),
('Florida Keys', 'lake', 'FL', 'Islamorada', 24.9242, -80.6278, ARRAY['tarpon', 'permit', 'bonefish'], 'Legendary saltwater fly fishing destination.'),

-- GEORGIA
('Chattahoochee River', 'river', 'GA', 'Atlanta', 33.8792, -84.4561, ARRAY['rainbow trout', 'brown trout'], 'Urban tailwater with excellent year-round fishing.'),
('Toccoa River', 'river', 'GA', 'Blue Ridge', 34.8642, -84.3242, ARRAY['rainbow trout', 'brown trout'], 'Quality tailwater in the north Georgia mountains.'),
('Soque River', 'river', 'GA', 'Clarkesville', 34.6125, -83.5250, ARRAY['rainbow trout', 'brown trout'], 'Private and public water with large fish.'),

-- IDAHO (additional)
('Big Wood River', 'river', 'ID', 'Ketchum', 43.6808, -114.3636, ARRAY['rainbow trout', 'brown trout'], 'Sun Valley area freestone with scenic mountain backdrop.'),
('South Fork Snake River', 'river', 'ID', 'Idaho Falls', 43.4917, -111.9833, ARRAY['cutthroat trout', 'brown trout', 'rainbow trout'], 'Blue-ribbon water with massive hatches.'),
('Teton River', 'river', 'ID', 'Driggs', 43.7233, -111.1117, ARRAY['cutthroat trout', 'rainbow trout'], 'Underrated fishery near Grand Teton.'),
('Middle Fork Salmon', 'river', 'ID', 'Stanley', 44.8667, -115.0000, ARRAY['cutthroat trout', 'steelhead', 'chinook salmon'], 'Remote wilderness river, float trips only.'),

-- MAINE
('Kennebec River', 'river', 'ME', 'The Forks', 45.3542, -69.9681, ARRAY['landlocked salmon', 'brook trout', 'brown trout'], 'Large river with excellent landlocked salmon fishing.'),
('Rapid River', 'river', 'ME', 'Upton', 44.8333, -70.8833, ARRAY['brook trout', 'landlocked salmon'], 'Remote stream with wild brook trout.'),
('Rangeley Region', 'lake', 'ME', 'Rangeley', 44.9667, -70.6333, ARRAY['brook trout', 'landlocked salmon'], 'Historic Maine fly fishing destination.'),
('Moosehead Lake', 'lake', 'ME', 'Greenville', 45.6500, -69.6167, ARRAY['brook trout', 'landlocked salmon', 'lake trout'], 'Maine''s largest lake with excellent fishing.'),

-- MICHIGAN (additional)
('Little Manistee River', 'river', 'MI', 'Irons', 44.1333, -85.9167, ARRAY['brown trout', 'steelhead', 'salmon'], 'Excellent steelhead and salmon runs.'),
('Boardman River', 'river', 'MI', 'Traverse City', 44.7631, -85.6206, ARRAY['brown trout', 'steelhead'], 'Urban fishery with wild brown trout.'),
('Muskegon River', 'river', 'MI', 'Newaygo', 43.4186, -85.7994, ARRAY['brown trout', 'steelhead', 'salmon'], 'Large river with diverse fishing opportunities.'),

-- MINNESOTA
('Driftless Region Streams', 'stream', 'MN', 'Lanesboro', 43.7189, -91.9756, ARRAY['brown trout', 'brook trout'], 'Limestone spring creeks with wild trout.'),
('Whitewater River', 'river', 'MN', 'Elba', 44.0833, -92.0333, ARRAY['brown trout', 'brook trout'], 'Beautiful coulee country trout stream.'),
('Root River', 'river', 'MN', 'Preston', 43.6703, -92.0831, ARRAY['brown trout', 'brook trout'], 'Driftless area stream with excellent access.'),

-- MISSOURI
('Current River', 'river', 'MO', 'Van Buren', 36.9958, -91.0147, ARRAY['rainbow trout', 'brown trout'], 'National Scenic River with spring-fed waters.'),
('North Fork White River', 'river', 'MO', 'Dora', 36.7750, -92.2183, ARRAY['rainbow trout', 'brown trout'], 'Wild trout water in the Ozarks.'),
('Eleven Point River', 'river', 'MO', 'Alton', 36.6942, -91.3978, ARRAY['rainbow trout', 'smallmouth bass'], 'Clear Ozark stream with mixed fishery.'),

-- MONTANA (additional)
('Rock Creek', 'river', 'MT', 'Clinton', 46.7667, -113.7167, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Classic Montana freestone near Missoula.'),
('Bitterroot River', 'river', 'MT', 'Hamilton', 46.2458, -114.1617, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Beautiful valley river with excellent access.'),
('Smith River', 'river', 'MT', 'White Sulphur Springs', 46.5486, -110.9022, ARRAY['rainbow trout', 'brown trout'], 'Permit-only float river through limestone canyon.'),
('Blackfoot River', 'river', 'MT', 'Missoula', 46.8833, -113.9833, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout', 'bull trout'], 'A River Runs Through It fame, recovering fishery.'),
('Kootenai River', 'river', 'MT', 'Libby', 48.3886, -115.5556, ARRAY['rainbow trout', 'bull trout'], 'Large river below Libby Dam.'),
('Clark Fork River', 'river', 'MT', 'Missoula', 46.8722, -114.0094, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'Large urban river with surprising quality.'),

-- NEVADA
('Truckee River (NV)', 'river', 'NV', 'Reno', 39.5296, -119.8138, ARRAY['rainbow trout', 'brown trout'], 'Urban fishery through downtown Reno.'),
('Pyramid Lake', 'lake', 'NV', 'Nixon', 39.9833, -119.5167, ARRAY['lahontan cutthroat trout'], 'Trophy cutthroat destination on Paiute tribal land.'),

-- NEW HAMPSHIRE
('Connecticut River', 'river', 'NH', 'Pittsburg', 45.0667, -71.3500, ARRAY['rainbow trout', 'brown trout', 'landlocked salmon'], 'Upper sections near headwaters.'),
('Androscoggin River', 'river', 'NH', 'Berlin', 44.4686, -71.1850, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Recovering river with improving fishery.'),

-- NEW JERSEY
('South Branch Raritan', 'river', 'NJ', 'Califon', 40.7167, -74.8333, ARRAY['brown trout', 'rainbow trout'], 'Best trout water in New Jersey.'),
('Big Flat Brook', 'stream', 'NJ', 'Walpack', 41.1500, -74.8833, ARRAY['brown trout', 'brook trout'], 'Wild trout stream in northwest NJ.'),

-- NEW MEXICO (additional)
('Pecos River', 'river', 'NM', 'Pecos', 35.5722, -105.6783, ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'], 'High mountain river with good access.'),
('Red River', 'river', 'NM', 'Red River', 36.7064, -105.4064, ARRAY['rainbow trout', 'brown trout'], 'Popular fishery near ski resort.'),
('Cimarron River', 'river', 'NM', 'Cimarron', 36.5103, -104.9150, ARRAY['rainbow trout', 'brown trout'], 'Private and public water with quality fish.'),

-- NORTH CAROLINA (additional)
('South Toe River', 'river', 'NC', 'Burnsville', 35.8875, -82.3000, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Mountain freestone with wild trout.'),
('Watauga River', 'river', 'NC', 'Valle Crucis', 36.2083, -81.7833, ARRAY['rainbow trout', 'brown trout'], 'Quality tailwater and freestone sections.'),
('Cataloochee Creek', 'creek', 'NC', 'Maggie Valley', 35.6375, -83.1083, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Wild trout stream in Great Smoky Mountains.'),

-- OHIO
('Mad River', 'river', 'OH', 'Urbana', 40.1083, -83.7517, ARRAY['brown trout', 'rainbow trout'], 'Ohio''s best trout stream, spring-fed limestone.'),
('Clear Creek', 'creek', 'OH', 'Rockbridge', 39.5847, -82.5625, ARRAY['brown trout', 'rainbow trout'], 'Small stream with wild brown trout.'),

-- OREGON (additional)
('North Umpqua River', 'river', 'OR', 'Roseburg', 43.2767, -123.3408, ARRAY['steelhead', 'rainbow trout', 'chinook salmon'], 'Legendary summer steelhead water.'),
('Rogue River', 'river', 'OR', 'Grants Pass', 42.4392, -123.3289, ARRAY['steelhead', 'chinook salmon', 'rainbow trout'], 'Wild and scenic river with excellent runs.'),
('Grande Ronde River', 'river', 'OR', 'La Grande', 45.3275, -118.0875, ARRAY['steelhead', 'rainbow trout'], 'Remote canyon river with good steelhead.'),
('John Day River', 'river', 'OR', 'John Day', 44.4200, -118.9528, ARRAY['smallmouth bass', 'steelhead'], 'Longest undammed river in Oregon.'),
('Williamson River', 'river', 'OR', 'Chiloquin', 42.5833, -121.8667, ARRAY['rainbow trout', 'brown trout'], 'Spring creek with trophy fish potential.'),

-- PENNSYLVANIA (additional)
('Big Fishing Creek', 'creek', 'PA', 'Lamar', 41.0167, -77.4833, ARRAY['brown trout', 'rainbow trout'], 'Premier Pennsylvania limestone stream.'),
('Kettle Creek', 'creek', 'PA', 'Renovo', 41.3333, -77.7500, ARRAY['brown trout', 'brook trout'], 'Remote freestone with wild trout.'),
('Lehigh River', 'river', 'PA', 'White Haven', 41.0500, -75.7833, ARRAY['brown trout', 'rainbow trout'], 'Tailwater section below Francis E. Walter Dam.'),
('Delaware River (Upper)', 'river', 'PA', 'Equinunk', 41.8500, -75.2333, ARRAY['rainbow trout', 'brown trout', 'shad'], 'Wild trout and excellent shad runs.'),

-- SOUTH CAROLINA
('Chattooga River', 'river', 'SC', 'Mountain Rest', 34.8167, -83.1667, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Wild and scenic river, Deliverance fame.'),
('Saluda River', 'river', 'SC', 'Columbia', 34.0333, -81.1167, ARRAY['rainbow trout', 'brown trout'], 'Urban tailwater with year-round fishing.'),

-- SOUTH DAKOTA
('Rapid Creek', 'creek', 'SD', 'Rapid City', 44.0806, -103.2311, ARRAY['brown trout', 'rainbow trout'], 'Urban trout fishery through city center.'),
('Spearfish Creek', 'creek', 'SD', 'Spearfish', 44.4908, -103.8592, ARRAY['brown trout', 'rainbow trout'], 'Black Hills stream with excellent access.'),

-- TEXAS
('Guadalupe River', 'river', 'TX', 'New Braunfels', 29.7089, -98.1256, ARRAY['rainbow trout', 'brown trout'], 'Southernmost trout fishery in the US.'),
('South Llano River', 'river', 'TX', 'Junction', 30.4894, -99.7728, ARRAY['guadalupe bass', 'rio grande cichlid'], 'Texas hill country bass fishing.'),

-- UTAH (additional)
('Weber River', 'river', 'UT', 'Oakley', 40.7153, -111.2972, ARRAY['brown trout', 'rainbow trout'], 'Blue Ribbon fishery near Park City.'),
('Logan River', 'river', 'UT', 'Logan', 41.7356, -111.8339, ARRAY['brown trout', 'cutthroat trout'], 'Beautiful canyon stream in Cache Valley.'),
('Strawberry Reservoir', 'lake', 'UT', 'Heber City', 40.1667, -111.1833, ARRAY['cutthroat trout', 'rainbow trout', 'kokanee salmon'], 'Utah''s premier stillwater fishery.'),

-- VIRGINIA (additional)
('Mossy Creek', 'creek', 'VA', 'Bridgewater', 38.3833, -79.0000, ARRAY['brown trout', 'rainbow trout'], 'Trophy spring creek with catch and release.'),
('Rapidan River', 'river', 'VA', 'Madison', 38.3833, -78.2667, ARRAY['brook trout', 'rainbow trout'], 'Native brook trout in Shenandoah National Park.'),
('New River', 'river', 'VA', 'Radford', 37.1317, -80.5764, ARRAY['smallmouth bass', 'musky'], 'Ancient river with excellent smallmouth.'),

-- WASHINGTON (additional)
('Methow River', 'river', 'WA', 'Winthrop', 48.4700, -120.1861, ARRAY['rainbow trout', 'steelhead', 'chinook salmon'], 'North Cascades freestone with anadromous runs.'),
('Spokane River', 'river', 'WA', 'Spokane', 47.6589, -117.4250, ARRAY['rainbow trout', 'brown trout'], 'Urban fishery with redband trout.'),
('Skagit River', 'river', 'WA', 'Marblemount', 48.5333, -121.4333, ARRAY['steelhead', 'chinook salmon', 'rainbow trout'], 'Major steelhead river.'),
('Grande Ronde (WA)', 'river', 'WA', 'Anatone', 46.1000, -117.0667, ARRAY['steelhead', 'rainbow trout'], 'Washington side of the canyon.'),

-- WEST VIRGINIA (additional)
('Williams River', 'river', 'WV', 'Marlinton', 38.2167, -80.2833, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Mountain stream in Monongahela National Forest.'),
('Shavers Fork', 'river', 'WV', 'Durbin', 38.5500, -79.8500, ARRAY['rainbow trout', 'brook trout'], 'Remote mountain river with wild fish.'),
('South Branch Potomac', 'river', 'WV', 'Petersburg', 38.9922, -79.1231, ARRAY['rainbow trout', 'brown trout', 'smallmouth bass'], 'Diverse fishery through the Trough.'),

-- WISCONSIN
('Driftless Area Streams', 'stream', 'WI', 'Viroqua', 43.5569, -90.8892, ARRAY['brown trout', 'brook trout'], 'Hundreds of spring creeks with wild trout.'),
('Bois Brule River', 'river', 'WI', 'Brule', 46.5333, -91.5833, ARRAY['brook trout', 'brown trout', 'steelhead'], 'Historic river where presidents fished.'),
('Wolf River', 'river', 'WI', 'Langlade', 45.1833, -89.0500, ARRAY['brook trout', 'brown trout'], 'Northwoods freestone with excellent hatches.'),
('Timber Coulee Creek', 'creek', 'WI', 'Westby', 43.6667, -90.8500, ARRAY['brown trout', 'brook trout'], 'Classic driftless spring creek.'),

-- WYOMING (additional)
('Bighorn River (WY)', 'river', 'WY', 'Thermopolis', 43.6461, -108.2117, ARRAY['rainbow trout', 'brown trout'], 'Wedding of the Waters section.'),
('Tongue River', 'river', 'WY', 'Dayton', 44.8744, -107.2589, ARRAY['rainbow trout', 'brown trout'], 'Underrated fishery below the Bighorns.'),
('Wind River', 'river', 'WY', 'Dubois', 43.5347, -109.6303, ARRAY['cutthroat trout', 'rainbow trout', 'brown trout'], 'Remote mountain river with wild fish.'),
('New Fork River', 'river', 'WY', 'Pinedale', 42.8667, -109.8500, ARRAY['brown trout', 'rainbow trout'], 'Green River tributary with large fish.');
