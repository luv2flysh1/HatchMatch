-- Add major fishing lakes and reservoirs across key fly fishing states
-- Using individual INSERT ON CONFLICT to avoid type casting issues

-- WASHINGTON
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lake Chelan', 'lake', 'WA', 'Chelan', 47.8397, -120.0167,
   ARRAY['rainbow trout', 'kokanee salmon', 'chinook salmon', 'lake trout'],
   'Deep glacial lake in the Cascades. Excellent kokanee and trout fishing year-round.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Banks Lake', 'lake', 'WA', 'Electric City', 47.9347, -119.1583,
   ARRAY['rainbow trout', 'walleye', 'smallmouth bass', 'largemouth bass'],
   'Large reservoir in the Columbia Basin. Great stillwater fishing with diverse species.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Rufus Woods Lake', 'lake', 'WA', 'Bridgeport', 47.9500, -119.6000,
   ARRAY['rainbow trout', 'kokanee salmon', 'walleye'],
   'Columbia River reservoir known for trophy triploid rainbows.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lake Roosevelt', 'lake', 'WA', 'Kettle Falls', 48.1667, -118.0833,
   ARRAY['rainbow trout', 'walleye', 'kokanee salmon', 'smallmouth bass'],
   'Massive Columbia River reservoir. 130+ miles of fishing water.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Dry Falls Lake', 'lake', 'WA', 'Coulee City', 47.5833, -119.3833,
   ARRAY['rainbow trout', 'brown trout'],
   'Productive stillwater in Sun Lakes State Park. Selective gear rules.')
ON CONFLICT DO NOTHING;

-- COLORADO
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Blue Mesa Reservoir', 'lake', 'CO', 'Gunnison', 38.4700, -107.2200,
   ARRAY['rainbow trout', 'brown trout', 'kokanee salmon', 'lake trout'],
   'Colorado''s largest body of water. Trophy kokanee and lake trout.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Spinney Mountain Reservoir', 'lake', 'CO', 'Lake George', 38.9833, -105.6833,
   ARRAY['rainbow trout', 'cutthroat trout', 'northern pike'],
   'Gold Medal stillwater with trophy trout. Float tube paradise.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Antero Reservoir', 'lake', 'CO', 'Hartsel', 38.9500, -105.8833,
   ARRAY['rainbow trout', 'cutthroat trout', 'brown trout'],
   'High-elevation reservoir in South Park. Known for large rainbows.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lake Granby', 'lake', 'CO', 'Grand Lake', 40.1667, -105.8667,
   ARRAY['rainbow trout', 'brown trout', 'kokanee salmon', 'lake trout'],
   'Second largest body of water in Colorado. Excellent kokanee fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Horsetooth Reservoir', 'lake', 'CO', 'Fort Collins', 40.5500, -105.1833,
   ARRAY['rainbow trout', 'brown trout', 'walleye', 'smallmouth bass'],
   'Popular Front Range reservoir with diverse fishing opportunities.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lake Dillon', 'lake', 'CO', 'Dillon', 39.6333, -106.0667,
   ARRAY['rainbow trout', 'brown trout', 'kokanee salmon', 'arctic char'],
   'High-altitude reservoir near Breckenridge. Good ice fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Tarryall Reservoir', 'lake', 'CO', 'Lake George', 39.1167, -105.5167,
   ARRAY['rainbow trout', 'cutthroat trout', 'tiger muskie'],
   'South Park reservoir with excellent trout and pike fishing.')
ON CONFLICT DO NOTHING;

-- MONTANA
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Flathead Lake', 'lake', 'MT', 'Polson', 47.8833, -114.1667,
   ARRAY['lake trout', 'bull trout', 'cutthroat trout', 'whitefish'],
   'Largest natural freshwater lake west of Mississippi. Trophy lake trout.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Fort Peck Lake', 'lake', 'MT', 'Fort Peck', 47.5833, -106.6667,
   ARRAY['walleye', 'northern pike', 'lake trout', 'smallmouth bass'],
   'Massive Missouri River reservoir. Outstanding walleye and pike.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Canyon Ferry Lake', 'lake', 'MT', 'Helena', 46.6500, -111.7333,
   ARRAY['rainbow trout', 'brown trout', 'perch', 'walleye'],
   'Popular Helena-area reservoir with consistent trout fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Hauser Lake', 'lake', 'MT', 'Helena', 46.7833, -112.0333,
   ARRAY['rainbow trout', 'brown trout', 'kokanee salmon'],
   'Missouri River reservoir below Canyon Ferry. Excellent shore access.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Georgetown Lake', 'lake', 'MT', 'Anaconda', 46.2000, -113.3000,
   ARRAY['rainbow trout', 'brook trout', 'kokanee salmon'],
   'High-altitude lake with strong rainbow and brook trout populations.')
ON CONFLICT DO NOTHING;

-- WYOMING
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Flaming Gorge Reservoir', 'lake', 'WY', 'Green River', 41.0833, -109.5500,
   ARRAY['rainbow trout', 'brown trout', 'lake trout', 'kokanee salmon', 'smallmouth bass'],
   'Trophy trout destination spanning WY-UT border. Blue-ribbon below dam.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Jackson Lake', 'lake', 'WY', 'Moran', 43.8667, -110.6667,
   ARRAY['cutthroat trout', 'lake trout', 'brown trout'],
   'Grand Teton National Park lake with stunning mountain backdrop.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Pathfinder Reservoir', 'lake', 'WY', 'Alcova', 42.4667, -106.8500,
   ARRAY['rainbow trout', 'brown trout', 'walleye'],
   'North Platte River reservoir with good trout and walleye.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Boysen Reservoir', 'lake', 'WY', 'Shoshoni', 43.2333, -108.1667,
   ARRAY['walleye', 'rainbow trout', 'brown trout', 'perch'],
   'Wind River reservoir popular for walleye and trout.')
ON CONFLICT DO NOTHING;

-- UTAH
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Strawberry Reservoir', 'lake', 'UT', 'Heber City', 40.1667, -111.1833,
   ARRAY['cutthroat trout', 'rainbow trout', 'kokanee salmon'],
   'Premier Utah trout fishery. Outstanding cutthroat population.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Fish Lake', 'lake', 'UT', 'Richfield', 38.5833, -111.7000,
   ARRAY['lake trout', 'rainbow trout', 'splake', 'perch'],
   'High-elevation natural lake with trophy lake trout potential.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Jordanelle Reservoir', 'lake', 'UT', 'Heber City', 40.6000, -111.4167,
   ARRAY['rainbow trout', 'brown trout', 'smallmouth bass', 'perch'],
   'Scenic Wasatch Mountain reservoir with diverse fishery.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Deer Creek Reservoir', 'lake', 'UT', 'Heber City', 40.4167, -111.5167,
   ARRAY['rainbow trout', 'brown trout', 'smallmouth bass', 'walleye'],
   'Popular Provo River reservoir. Good shore and boat fishing.')
ON CONFLICT DO NOTHING;

-- IDAHO
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Payette Lake', 'lake', 'ID', 'McCall', 44.9833, -116.1000,
   ARRAY['rainbow trout', 'kokanee salmon', 'mackinaw'],
   'Beautiful mountain lake in McCall. Good year-round fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Cascade Reservoir', 'lake', 'ID', 'Cascade', 44.5333, -116.0500,
   ARRAY['rainbow trout', 'perch', 'coho salmon'],
   'Large central Idaho reservoir with diverse species.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lake Coeur d''Alene', 'lake', 'ID', 'Coeur d''Alene', 47.6333, -116.7667,
   ARRAY['cutthroat trout', 'rainbow trout', 'chinook salmon', 'bass'],
   'Scenic lake with excellent cutthroat and kokanee fishing.')
ON CONFLICT DO NOTHING;

-- OREGON
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Crane Prairie Reservoir', 'lake', 'OR', 'Bend', 43.7833, -121.7833,
   ARRAY['rainbow trout', 'brook trout', 'largemouth bass'],
   'Outstanding stillwater fishery in the Cascades. Trophy rainbows.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Wickiup Reservoir', 'lake', 'OR', 'Bend', 43.6833, -121.7667,
   ARRAY['brown trout', 'rainbow trout', 'kokanee salmon'],
   'Cascade reservoir known for large brown trout.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Odell Lake', 'lake', 'OR', 'Crescent', 43.5667, -121.9667,
   ARRAY['kokanee salmon', 'rainbow trout', 'lake trout', 'bull trout'],
   'Deep Cascade lake with excellent trolling for mackinaw.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('East Lake', 'lake', 'OR', 'La Pine', 43.7167, -121.2000,
   ARRAY['rainbow trout', 'brown trout', 'atlantic salmon'],
   'Volcanic caldera lake with quality trout. Unique fishery.')
ON CONFLICT DO NOTHING;

-- ARIZONA
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lake Powell', 'lake', 'AZ', 'Page', 37.0667, -111.4833,
   ARRAY['striped bass', 'largemouth bass', 'smallmouth bass', 'walleye'],
   'Massive Colorado River reservoir. Premier bass fishery.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lees Ferry', 'lake', 'AZ', 'Marble Canyon', 36.8667, -111.5833,
   ARRAY['rainbow trout', 'brown trout'],
   'Blue-ribbon tailwater below Glen Canyon Dam. World-class.')
ON CONFLICT DO NOTHING;

-- CALIFORNIA
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Crowley Lake', 'lake', 'CA', 'Mammoth Lakes', 37.5500, -118.7167,
   ARRAY['rainbow trout', 'brown trout', 'cutthroat trout', 'sacramento perch'],
   'Eastern Sierra stillwater. Famous opener and fall spawning runs.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Bridgeport Reservoir', 'lake', 'CA', 'Bridgeport', 38.3167, -119.2167,
   ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'],
   'High-desert reservoir with trophy potential. Float tube paradise.')
ON CONFLICT DO NOTHING;

-- NEVADA
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Pyramid Lake', 'lake', 'NV', 'Nixon', 40.0000, -119.5000,
   ARRAY['lahontan cutthroat trout', 'sacramento perch'],
   'Desert lake with trophy Lahontan cutthroat. Unique fishery.')
ON CONFLICT DO NOTHING;

-- NEW MEXICO
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Navajo Lake', 'lake', 'NM', 'Navajo Dam', 36.8000, -107.6167,
   ARRAY['rainbow trout', 'brown trout', 'kokanee salmon', 'largemouth bass'],
   'Quality waters section. San Juan tailwater nearby.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Heron Lake', 'lake', 'NM', 'Tierra Amarilla', 36.6833, -106.7167,
   ARRAY['rainbow trout', 'kokanee salmon', 'lake trout'],
   'No-wake lake popular with float tubers and kayak anglers.')
ON CONFLICT DO NOTHING;
