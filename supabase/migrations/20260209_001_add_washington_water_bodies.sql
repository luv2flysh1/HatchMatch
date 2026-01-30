-- Migration: Add Washington State and popular fly fishing water bodies
-- Data sourced from: USGS, WDFW, State Fish & Game departments
-- Run with: supabase db push

-- ============================================
-- WASHINGTON STATE WATERS (Primary Focus)
-- ============================================

-- Major Rivers - Western Washington
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Snoqualmie River', 'river', 'WA', 'North Bend', 47.4957, -121.7867,
   ARRAY['rainbow trout', 'cutthroat trout', 'steelhead', 'coho salmon', 'pink salmon'],
   '12144500',
   'Popular Puget Sound tributary with excellent winter steelhead. Three forks offer diverse fishing from technical headwaters to larger mainstem pools.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Snoqualmie River - Middle Fork', 'river', 'WA', 'North Bend', 47.5456, -121.5378,
   ARRAY['rainbow trout', 'cutthroat trout', 'bull trout'],
   'Remote headwaters with wild trout. Access via Middle Fork Road. Catch and release for bull trout.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Snoqualmie River - South Fork', 'river', 'WA', 'North Bend', 47.4231, -121.5883,
   ARRAY['rainbow trout', 'cutthroat trout'],
   'Scenic fork paralleling I-90. Good pocket water fishing with consistent hatches.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Snoqualmie River - North Fork', 'river', 'WA', 'North Bend', 47.5789, -121.5944,
   ARRAY['rainbow trout', 'cutthroat trout'],
   'Smallest of the three forks with wild cutthroat. Remote fishing experience.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Skykomish River', 'river', 'WA', 'Sultan', 47.8617, -121.8128,
   ARRAY['steelhead', 'rainbow trout', 'cutthroat trout', 'chinook salmon', 'coho salmon', 'pink salmon'],
   '12134500',
   'Premier steelhead river with excellent summer and winter runs. South Fork offers quality resident trout fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Skykomish River - South Fork', 'river', 'WA', 'Index', 47.8206, -121.5542,
   ARRAY['rainbow trout', 'cutthroat trout', 'bull trout', 'steelhead'],
   'Beautiful mountain river with excellent freestone fishing. Wild trout above Index.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Stillaguamish River', 'river', 'WA', 'Arlington', 48.1989, -122.1256,
   ARRAY['steelhead', 'cutthroat trout', 'chinook salmon', 'coho salmon'],
   '12167000',
   'North Fork offers wild steelhead. Deer Creek tributary has protected bull trout population.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Sauk River', 'river', 'WA', 'Darrington', 48.2564, -121.6092,
   ARRAY['steelhead', 'rainbow trout', 'bull trout', 'chinook salmon'],
   '12186000',
   'Remote glacier-fed river with wild steelhead and bull trout. Scenic but challenging wading.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Skagit River', 'river', 'WA', 'Marblemount', 48.5339, -121.4444,
   ARRAY['steelhead', 'rainbow trout', 'bull trout', 'dolly varden', 'chinook salmon', 'coho salmon'],
   '12178100',
   'Major Puget Sound river system with legendary steelhead runs. Upper reaches offer quality trout fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Nooksack River', 'river', 'WA', 'Deming', 48.8122, -122.2339,
   ARRAY['steelhead', 'rainbow trout', 'cutthroat trout', 'chinook salmon', 'coho salmon'],
   '12213100',
   'Three forks offer diverse fishing from glacial mainstem to clear tributaries.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Green River', 'river', 'WA', 'Auburn', 47.3222, -122.2158,
   ARRAY['rainbow trout', 'steelhead', 'chinook salmon', 'coho salmon'],
   '12113000',
   'Urban fishery with surprising quality. Gorge section offers best trout fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Cedar River', 'river', 'WA', 'Renton', 47.4722, -122.1167,
   ARRAY['rainbow trout', 'cutthroat trout', 'sockeye salmon', 'chinook salmon'],
   'Seattle-area river with restored salmon runs. Lower river open seasonally.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Puyallup River', 'river', 'WA', 'Puyallup', 47.1864, -122.2925,
   ARRAY['steelhead', 'rainbow trout', 'chinook salmon', 'coho salmon', 'pink salmon'],
   '12101500',
   'Glacial river with excellent salmon and steelhead runs. Carbon River tributary offers clearer water.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Nisqually River', 'river', 'WA', 'Yelm', 46.9564, -122.5222,
   ARRAY['steelhead', 'rainbow trout', 'cutthroat trout', 'chinook salmon', 'coho salmon'],
   '12089500',
   'Mt. Rainier-fed river with quality steelhead runs. Upper reaches offer wild trout.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Cowlitz River', 'river', 'WA', 'Castle Rock', 46.2756, -122.9069,
   ARRAY['steelhead', 'rainbow trout', 'cutthroat trout', 'chinook salmon', 'coho salmon'],
   '14243000',
   'Major Columbia tributary with excellent salmon and steelhead. Blue Creek hatchery provides fish.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Lewis River', 'river', 'WA', 'Woodland', 45.9400, -122.7756,
   ARRAY['steelhead', 'rainbow trout', 'chinook salmon', 'coho salmon'],
   '14220500',
   'North Fork offers excellent wild steelhead. East Fork provides quality resident trout.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Kalama River', 'river', 'WA', 'Kalama', 46.0081, -122.8403,
   ARRAY['steelhead', 'rainbow trout', 'chinook salmon', 'coho salmon'],
   'Wild steelhead river with excellent catch rates. Popular fly water in upper sections.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Toutle River', 'river', 'WA', 'Toutle', 46.3147, -122.9217,
   ARRAY['steelhead', 'cutthroat trout', 'chinook salmon'],
   'Recovering post-Mt. St. Helens eruption. North Fork has restored steelhead runs.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Wind River', 'river', 'WA', 'Carson', 45.7264, -121.8089,
   ARRAY['steelhead', 'rainbow trout', 'chinook salmon'],
   'Columbia Gorge tributary with wild steelhead. Beautiful canyon scenery.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('White Salmon River', 'river', 'WA', 'White Salmon', 45.7300, -121.4878,
   ARRAY['steelhead', 'rainbow trout', 'chinook salmon', 'coho salmon'],
   'Dam removed in 2011 restored fish passage. Excellent steelhead and salmon fishery.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Klickitat River', 'river', 'WA', 'Lyle', 45.6989, -121.2833,
   ARRAY['steelhead', 'rainbow trout', 'chinook salmon'],
   '14113000',
   'Remote canyon river with wild steelhead. Summer runs offer dry fly opportunities.')
ON CONFLICT DO NOTHING;

-- Central & Eastern Washington
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Yakima River - Upper Canyon', 'river', 'WA', 'Cle Elum', 47.1836, -120.9367,
   ARRAY['rainbow trout', 'cutthroat trout', 'bull trout'],
   'Technical water above Ellensburg. Wild rainbows and occasional bull trout sightings.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Yakima River - Lower Canyon', 'river', 'WA', 'Selah', 46.7208, -120.5111,
   ARRAY['rainbow trout', 'smallmouth bass', 'mountain whitefish'],
   'Warmer water section with excellent late-season fishing. PMD and caddis hatches.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Naches River', 'river', 'WA', 'Naches', 46.7319, -120.7094,
   ARRAY['rainbow trout', 'cutthroat trout', 'mountain whitefish'],
   '12494000',
   'Major Yakima tributary with quality wild trout. Little Naches offers small stream fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Crab Creek', 'creek', 'WA', 'Moses Lake', 47.1169, -119.2778,
   ARRAY['rainbow trout', 'brown trout', 'largemouth bass'],
   'Columbia Basin stream with spring creek sections. Quality trout in upper reaches.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Methow River', 'river', 'WA', 'Winthrop', 48.4733, -120.1856,
   ARRAY['rainbow trout', 'cutthroat trout', 'steelhead', 'chinook salmon'],
   '12449500',
   'Beautiful Okanogan valley river with wild trout and recovering steelhead. Cold, clear water year-round.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Wenatchee River', 'river', 'WA', 'Leavenworth', 47.5961, -120.6608,
   ARRAY['rainbow trout', 'cutthroat trout', 'steelhead', 'chinook salmon', 'mountain whitefish'],
   '12462500',
   'Scenic river through Bavarian-themed Leavenworth. Wild trout and salmon runs.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Entiat River', 'river', 'WA', 'Entiat', 47.6731, -120.5278,
   ARRAY['rainbow trout', 'cutthroat trout', 'steelhead', 'chinook salmon'],
   'Small Columbia tributary with wild trout in upper reaches. Remote fishing experience.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Okanogan River', 'river', 'WA', 'Okanogan', 48.3622, -119.5856,
   ARRAY['rainbow trout', 'smallmouth bass', 'steelhead', 'chinook salmon'],
   '12447390',
   'Large river from Canada with recovering steelhead runs. Warm summer temps favor bass.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Spokane River', 'river', 'WA', 'Spokane', 47.6589, -117.4256,
   ARRAY['rainbow trout', 'brown trout', 'cutthroat trout', 'mountain whitefish'],
   '12422500',
   'Urban river with quality trout fishing. Below dam sections offer best opportunities.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Little Spokane River', 'river', 'WA', 'Spokane', 47.8089, -117.5022,
   ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'],
   'Small stream north of Spokane with wild trout. Catch and release section near mouth.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Grande Ronde River', 'river', 'WA', 'Anatone', 46.1086, -117.0628,
   ARRAY['steelhead', 'rainbow trout', 'smallmouth bass', 'chinook salmon'],
   '13333000',
   'Remote canyon river in SE Washington. Excellent wild steelhead and smallmouth bass.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Tucannon River', 'river', 'WA', 'Pomeroy', 46.4681, -117.5917,
   ARRAY['steelhead', 'rainbow trout', 'chinook salmon'],
   'Blue Mountains stream with wild steelhead. Upper reaches offer resident trout.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Touchet River', 'river', 'WA', 'Dayton', 46.3233, -117.9742,
   ARRAY['rainbow trout', 'steelhead', 'mountain whitefish'],
   'Small Blue Mountains river with wild trout. North and South forks offer quality fishing.')
ON CONFLICT DO NOTHING;

-- Washington Lakes
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lenice Lake', 'lake', 'WA', 'Ephrata', 47.0833, -119.3667,
   ARRAY['rainbow trout', 'brown trout'],
   'Quality waters selective gear lake. March-June prime season for chironomid fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Nunnally Lake', 'lake', 'WA', 'Ephrata', 47.0667, -119.3833,
   ARRAY['rainbow trout', 'brown trout'],
   'Walk-in quality waters lake. Excellent damselfly and callibaetis hatches.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Merry Lake', 'lake', 'WA', 'Ephrata', 47.0500, -119.4000,
   ARRAY['rainbow trout', 'brown trout'],
   'Third in the Seep Lakes chain. Quality fishing with fewer crowds.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lake Lenore', 'lake', 'WA', 'Soap Lake', 47.5000, -119.5167,
   ARRAY['lahontan cutthroat trout'],
   'Alkaline lake with trophy Lahontan cutthroat. Unique fishery with fish to 10+ pounds.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Pass Lake', 'lake', 'WA', 'Anacortes', 48.4500, -122.6167,
   ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'],
   'Selective gear lake on Fidalgo Island. Fly fishing only. Quality fish year-round.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Chopaka Lake', 'lake', 'WA', 'Loomis', 48.9333, -119.7167,
   ARRAY['rainbow trout'],
   'Remote fly fishing only lake near Canadian border. Trophy rainbows in beautiful setting.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lake Cassidy', 'lake', 'WA', 'Marysville', 48.0667, -122.1000,
   ARRAY['rainbow trout', 'kokanee salmon', 'largemouth bass'],
   'Lowland lake with quality trout stocking. Good year-round fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('American Lake', 'lake', 'WA', 'Lakewood', 47.1400, -122.5328,
   ARRAY['rainbow trout', 'cutthroat trout', 'kokanee salmon', 'largemouth bass'],
   'Large Puget Sound lowland lake with diverse fishery. Consistent trout stocking.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lake Washington', 'lake', 'WA', 'Seattle', 47.6167, -122.2500,
   ARRAY['rainbow trout', 'cutthroat trout', 'smallmouth bass', 'largemouth bass', 'sockeye salmon'],
   'Seattle''s urban lake with surprising fish diversity. Cutthroat near river mouths.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lake Sammamish', 'lake', 'WA', 'Issaquah', 47.5833, -122.0667,
   ARRAY['rainbow trout', 'cutthroat trout', 'kokanee salmon', 'smallmouth bass'],
   'Eastside suburban lake with quality kokanee fishing. Native cutthroat in tributaries.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Amber Lake', 'lake', 'WA', 'Cheney', 47.3333, -117.6833,
   ARRAY['rainbow trout', 'tiger trout'],
   'Eastern Washington quality waters lake. Trophy tiger trout stocked.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Medical Lake', 'lake', 'WA', 'Medical Lake', 47.5667, -117.6833,
   ARRAY['rainbow trout'],
   'Mineral lake with quality trout fishing. Good spring and fall seasons.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Omak Lake', 'lake', 'WA', 'Omak', 48.1833, -119.5000,
   ARRAY['lahontan cutthroat trout'],
   'Colville tribal lake with trophy Lahontan cutthroat. Tribal permit required.')
ON CONFLICT DO NOTHING;

-- ============================================
-- ADDITIONAL ICONIC WATERS (if not already present)
-- ============================================

-- Montana additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Rock Creek', 'river', 'MT', 'Clinton', 46.7667, -113.7167,
   ARRAY['rainbow trout', 'brown trout', 'cutthroat trout', 'brook trout', 'bull trout'],
   NULL,
   'Classic Montana freestone near Missoula. Great salmonfly and caddis hatches.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Clark Fork River', 'river', 'MT', 'Missoula', 46.8719, -114.0028,
   ARRAY['rainbow trout', 'brown trout', 'cutthroat trout', 'bull trout'],
   '12340000',
   'Western Montana''s largest river. Excellent hatches and diverse water types.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Smith River', 'river', 'MT', 'White Sulphur Springs', 46.5489, -110.9017,
   ARRAY['rainbow trout', 'brown trout'],
   'Permit-only multi-day float through limestone canyon. Unforgettable experience.')
ON CONFLICT DO NOTHING;

-- Idaho additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Middle Fork Salmon River', 'river', 'ID', 'Stanley', 44.6833, -115.2167,
   ARRAY['cutthroat trout', 'rainbow trout', 'bull trout', 'steelhead', 'chinook salmon'],
   'Wild and scenic river accessible only by permit float trip. Pristine wilderness fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Clearwater River', 'river', 'ID', 'Orofino', 46.4744, -116.2556,
   ARRAY['steelhead', 'rainbow trout', 'cutthroat trout', 'chinook salmon'],
   '13340000',
   'Premier steelhead river with B-run fish over 15 pounds. North Fork offers trout fishing.')
ON CONFLICT DO NOTHING;

-- Wyoming additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Gibbon River', 'river', 'WY', 'Yellowstone', 44.6847, -110.7364,
   ARRAY['rainbow trout', 'brown trout', 'brook trout', 'grayling'],
   'Yellowstone meadow stream with arctic grayling. Excellent dry fly fishing.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Lamar River', 'river', 'WY', 'Yellowstone', 44.8931, -110.2094,
   ARRAY['cutthroat trout'],
   'Yellowstone''s premier native cutthroat stream. Remote fishing in wolf and bison country.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Slough Creek', 'creek', 'WY', 'Yellowstone', 44.9278, -110.3500,
   ARRAY['cutthroat trout'],
   'Meadow creek with large, selective cutthroat. First and second meadows require hiking.')
ON CONFLICT DO NOTHING;

-- Colorado additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Rio Grande', 'river', 'CO', 'South Fork', 37.6714, -106.6417,
   ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'],
   'Southern Colorado headwaters with wild trout. Del Norte to South Fork is Gold Medal.')
ON CONFLICT DO NOTHING;

-- California additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Lower Sacramento River', 'river', 'CA', 'Redding', 40.5865, -122.3917,
   ARRAY['rainbow trout', 'steelhead', 'chinook salmon'],
   '11377100',
   'Premier California trout fishery. Tailwater with wild rainbows averaging 16-22 inches.')
ON CONFLICT DO NOTHING;

-- Oregon additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Fall River', 'river', 'OR', 'La Pine', 43.7833, -121.6333,
   ARRAY['rainbow trout', 'brook trout', 'brown trout'],
   'Spring creek with challenging fishing. Wild trout in clear, weedy water.')
ON CONFLICT DO NOTHING;

-- New York additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Esopus Creek', 'creek', 'NY', 'Phoenicia', 42.0842, -74.3139,
   ARRAY['rainbow trout', 'brown trout', 'brook trout'],
   'Catskill freestone with excellent rainbow fishing. Portal release provides cold water.')
ON CONFLICT DO NOTHING;

-- Pennsylvania additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Letort Spring Run', 'stream', 'PA', 'Carlisle', 40.2039, -77.1944,
   ARRAY['brown trout'],
   'Historic spring creek where modern technical fly fishing developed. Very challenging.')
ON CONFLICT DO NOTHING;

-- Tennessee additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Hiwassee River', 'river', 'TN', 'Delano', 35.3456, -84.5461,
   ARRAY['rainbow trout', 'brown trout'],
   'Southern Appalachian tailwater with quality fish. Delayed harvest section is popular.')
ON CONFLICT DO NOTHING;

-- Utah additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Logan River', 'river', 'UT', 'Logan', 41.7353, -111.8350,
   ARRAY['brown trout', 'rainbow trout', 'cutthroat trout'],
   'Northern Utah freestone with wild fish. Canyon section is most productive.')
ON CONFLICT DO NOTHING;

-- West Virginia additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Shavers Fork', 'river', 'WV', 'Elkins', 38.8833, -79.8333,
   ARRAY['brook trout', 'rainbow trout', 'brown trout'],
   'High-elevation freestone with wild trout. Remote upper section has native brookies.')
ON CONFLICT DO NOTHING;

-- New Mexico additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Cimarron River', 'river', 'NM', 'Cimarron', 36.5103, -104.9156,
   ARRAY['rainbow trout', 'brown trout', 'cutthroat trout'],
   'Small canyon stream with wild trout. Colin Neblett Wildlife Area provides access.')
ON CONFLICT DO NOTHING;

-- Maine additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Kennebago River', 'river', 'ME', 'Rangeley', 45.0833, -70.8167,
   ARRAY['brook trout', 'landlocked salmon'],
   'Premier Maine brook trout water. Fly fishing only with trophy fish potential.')
ON CONFLICT DO NOTHING;

-- Alaska additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Togiak River', 'river', 'AK', 'Dillingham', 59.0833, -160.4167,
   ARRAY['rainbow trout', 'arctic char', 'salmon', 'arctic grayling', 'dolly varden'],
   'Wild and scenic river with incredible fishing diversity. Remote fly-out access.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Copper River', 'river', 'AK', 'Glennallen', 61.4972, -145.5417,
   ARRAY['rainbow trout', 'sockeye salmon', 'king salmon', 'dolly varden'],
   'Large glacial system with famous salmon runs. Tributaries offer clear water fishing.')
ON CONFLICT DO NOTHING;

-- Nevada additions
INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description)
VALUES ('Pyramid Lake', 'lake', 'NV', 'Nixon', 40.0000, -119.5000,
   ARRAY['lahontan cutthroat trout', 'sacramento perch'],
   'Desert lake with trophy Lahontan cutthroat to 20+ pounds. Unique ladder fishing in fall/winter.')
ON CONFLICT DO NOTHING;

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('Truckee River', 'river', 'NV', 'Reno', 39.5294, -119.8128,
   ARRAY['rainbow trout', 'brown trout'],
   '10348000',
   'Urban fishery through downtown Reno. Quality trout in tailwater section.')
ON CONFLICT DO NOTHING;
