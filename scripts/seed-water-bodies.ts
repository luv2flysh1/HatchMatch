/**
 * Water Bodies Seed Script
 *
 * This script populates the water_bodies table with data from public sources:
 * - USGS National Hydrography Dataset (NHD) derived coordinates
 * - Washington Department of Fish & Wildlife (WDFW) fishing locations
 * - State fish and game department public stocking reports
 * - Geographic data from EPA WATERS GeoViewer
 *
 * Run with: npx ts-node scripts/seed-water-bodies.ts
 * Or: npx tsx scripts/seed-water-bodies.ts
 *
 * Prerequisites:
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 */

import { createClient } from '@supabase/supabase-js';

// Types matching the database schema
type WaterBodyType = 'river' | 'lake' | 'stream' | 'creek' | 'pond';

interface WaterBody {
  name: string;
  type: WaterBodyType;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  species: string[];
  usgs_site_id?: string;
  description: string;
}

// ============================================
// WASHINGTON STATE WATERS (Primary Focus)
// Data sourced from WDFW fishing regulations, USGS gauges, and geographic databases
// ============================================

const washingtonWaters: WaterBody[] = [
  // MAJOR RIVERS - Western Washington
  {
    name: 'Snoqualmie River',
    type: 'river',
    state: 'WA',
    city: 'North Bend',
    latitude: 47.4957,
    longitude: -121.7867,
    species: ['rainbow trout', 'cutthroat trout', 'steelhead', 'coho salmon', 'pink salmon'],
    usgs_site_id: '12144500',
    description: 'Popular Puget Sound tributary with excellent winter steelhead. Three forks offer diverse fishing from technical headwaters to larger mainstem pools.'
  },
  {
    name: 'Snoqualmie River - Middle Fork',
    type: 'river',
    state: 'WA',
    city: 'North Bend',
    latitude: 47.5456,
    longitude: -121.5378,
    species: ['rainbow trout', 'cutthroat trout', 'bull trout'],
    description: 'Remote headwaters with wild trout. Access via Middle Fork Road. Catch and release for bull trout.'
  },
  {
    name: 'Snoqualmie River - South Fork',
    type: 'river',
    state: 'WA',
    city: 'North Bend',
    latitude: 47.4231,
    longitude: -121.5883,
    species: ['rainbow trout', 'cutthroat trout'],
    description: 'Scenic fork paralleling I-90. Good pocket water fishing with consistent hatches.'
  },
  {
    name: 'Snoqualmie River - North Fork',
    type: 'river',
    state: 'WA',
    city: 'North Bend',
    latitude: 47.5789,
    longitude: -121.5944,
    species: ['rainbow trout', 'cutthroat trout'],
    description: 'Smallest of the three forks with wild cutthroat. Remote fishing experience.'
  },
  {
    name: 'Skykomish River',
    type: 'river',
    state: 'WA',
    city: 'Sultan',
    latitude: 47.8617,
    longitude: -121.8128,
    species: ['steelhead', 'rainbow trout', 'cutthroat trout', 'chinook salmon', 'coho salmon', 'pink salmon'],
    usgs_site_id: '12134500',
    description: 'Premier steelhead river with excellent summer and winter runs. South Fork offers quality resident trout fishing.'
  },
  {
    name: 'Skykomish River - South Fork',
    type: 'river',
    state: 'WA',
    city: 'Index',
    latitude: 47.8206,
    longitude: -121.5542,
    species: ['rainbow trout', 'cutthroat trout', 'bull trout', 'steelhead'],
    description: 'Beautiful mountain river with excellent freestone fishing. Wild trout above Index.'
  },
  {
    name: 'Stillaguamish River',
    type: 'river',
    state: 'WA',
    city: 'Arlington',
    latitude: 48.1989,
    longitude: -122.1256,
    species: ['steelhead', 'cutthroat trout', 'chinook salmon', 'coho salmon'],
    usgs_site_id: '12167000',
    description: 'North Fork offers wild steelhead. Deer Creek tributary has protected bull trout population.'
  },
  {
    name: 'Sauk River',
    type: 'river',
    state: 'WA',
    city: 'Darrington',
    latitude: 48.2564,
    longitude: -121.6092,
    species: ['steelhead', 'rainbow trout', 'bull trout', 'chinook salmon'],
    usgs_site_id: '12186000',
    description: 'Remote glacier-fed river with wild steelhead and bull trout. Scenic but challenging wading.'
  },
  {
    name: 'Skagit River',
    type: 'river',
    state: 'WA',
    city: 'Marblemount',
    latitude: 48.5339,
    longitude: -121.4444,
    species: ['steelhead', 'rainbow trout', 'bull trout', 'dolly varden', 'chinook salmon', 'coho salmon'],
    usgs_site_id: '12178100',
    description: 'Major Puget Sound river system with legendary steelhead runs. Upper reaches offer quality trout fishing.'
  },
  {
    name: 'Nooksack River',
    type: 'river',
    state: 'WA',
    city: 'Deming',
    latitude: 48.8122,
    longitude: -122.2339,
    species: ['steelhead', 'rainbow trout', 'cutthroat trout', 'chinook salmon', 'coho salmon'],
    usgs_site_id: '12213100',
    description: 'Three forks offer diverse fishing from glacial mainstem to clear tributaries.'
  },
  {
    name: 'Green River',
    type: 'river',
    state: 'WA',
    city: 'Auburn',
    latitude: 47.3222,
    longitude: -122.2158,
    species: ['rainbow trout', 'steelhead', 'chinook salmon', 'coho salmon'],
    usgs_site_id: '12113000',
    description: 'Urban fishery with surprising quality. Gorge section offers best trout fishing.'
  },
  {
    name: 'Cedar River',
    type: 'river',
    state: 'WA',
    city: 'Renton',
    latitude: 47.4722,
    longitude: -122.1167,
    species: ['rainbow trout', 'cutthroat trout', 'sockeye salmon', 'chinook salmon'],
    description: 'Seattle-area river with restored salmon runs. Lower river open seasonally.'
  },
  {
    name: 'Puyallup River',
    type: 'river',
    state: 'WA',
    city: 'Puyallup',
    latitude: 47.1864,
    longitude: -122.2925,
    species: ['steelhead', 'rainbow trout', 'chinook salmon', 'coho salmon', 'pink salmon'],
    usgs_site_id: '12101500',
    description: 'Glacial river with excellent salmon and steelhead runs. Carbon River tributary offers clearer water.'
  },
  {
    name: 'Nisqually River',
    type: 'river',
    state: 'WA',
    city: 'Yelm',
    latitude: 46.9564,
    longitude: -122.5222,
    species: ['steelhead', 'rainbow trout', 'cutthroat trout', 'chinook salmon', 'coho salmon'],
    usgs_site_id: '12089500',
    description: 'Mt. Rainier-fed river with quality steelhead runs. Upper reaches offer wild trout.'
  },
  {
    name: 'Cowlitz River',
    type: 'river',
    state: 'WA',
    city: 'Castle Rock',
    latitude: 46.2756,
    longitude: -122.9069,
    species: ['steelhead', 'rainbow trout', 'cutthroat trout', 'chinook salmon', 'coho salmon'],
    usgs_site_id: '14243000',
    description: 'Major Columbia tributary with excellent salmon and steelhead. Blue Creek hatchery provides fish.'
  },
  {
    name: 'Lewis River',
    type: 'river',
    state: 'WA',
    city: 'Woodland',
    latitude: 45.9400,
    longitude: -122.7756,
    species: ['steelhead', 'rainbow trout', 'chinook salmon', 'coho salmon'],
    usgs_site_id: '14220500',
    description: 'North Fork offers excellent wild steelhead. East Fork provides quality resident trout.'
  },
  {
    name: 'Kalama River',
    type: 'river',
    state: 'WA',
    city: 'Kalama',
    latitude: 46.0081,
    longitude: -122.8403,
    species: ['steelhead', 'rainbow trout', 'chinook salmon', 'coho salmon'],
    description: 'Wild steelhead river with excellent catch rates. Popular fly water in upper sections.'
  },
  {
    name: 'Toutle River',
    type: 'river',
    state: 'WA',
    city: 'Toutle',
    latitude: 46.3147,
    longitude: -122.9217,
    species: ['steelhead', 'cutthroat trout', 'chinook salmon'],
    description: 'Recovering post-Mt. St. Helens eruption. North Fork has restored steelhead runs.'
  },
  {
    name: 'Wind River',
    type: 'river',
    state: 'WA',
    city: 'Carson',
    latitude: 45.7264,
    longitude: -121.8089,
    species: ['steelhead', 'rainbow trout', 'chinook salmon'],
    description: 'Columbia Gorge tributary with wild steelhead. Beautiful canyon scenery.'
  },
  {
    name: 'White Salmon River',
    type: 'river',
    state: 'WA',
    city: 'White Salmon',
    latitude: 45.7300,
    longitude: -121.4878,
    species: ['steelhead', 'rainbow trout', 'chinook salmon', 'coho salmon'],
    description: 'Dam removed in 2011 restored fish passage. Excellent steelhead and salmon fishery.'
  },
  {
    name: 'Klickitat River',
    type: 'river',
    state: 'WA',
    city: 'Lyle',
    latitude: 45.6989,
    longitude: -121.2833,
    species: ['steelhead', 'rainbow trout', 'chinook salmon'],
    usgs_site_id: '14113000',
    description: 'Remote canyon river with wild steelhead. Summer runs offer dry fly opportunities.'
  },

  // CENTRAL & EASTERN WASHINGTON
  {
    name: 'Yakima River',
    type: 'river',
    state: 'WA',
    city: 'Ellensburg',
    latitude: 47.0025,
    longitude: -120.5478,
    species: ['rainbow trout', 'cutthroat trout', 'mountain whitefish'],
    usgs_site_id: '12484500',
    description: 'Washington\'s premier wild trout river. Blue-ribbon water from Ellensburg to Roza Dam with catch-and-release regulations.'
  },
  {
    name: 'Yakima River - Upper Canyon',
    type: 'river',
    state: 'WA',
    city: 'Cle Elum',
    latitude: 47.1836,
    longitude: -120.9367,
    species: ['rainbow trout', 'cutthroat trout', 'bull trout'],
    description: 'Technical water above Ellensburg. Wild rainbows and occasional bull trout sightings.'
  },
  {
    name: 'Yakima River - Lower Canyon',
    type: 'river',
    state: 'WA',
    city: 'Selah',
    latitude: 46.7208,
    longitude: -120.5111,
    species: ['rainbow trout', 'smallmouth bass', 'mountain whitefish'],
    description: 'Warmer water section with excellent late-season fishing. PMD and caddis hatches.'
  },
  {
    name: 'Naches River',
    type: 'river',
    state: 'WA',
    city: 'Naches',
    latitude: 46.7319,
    longitude: -120.7094,
    species: ['rainbow trout', 'cutthroat trout', 'mountain whitefish'],
    usgs_site_id: '12494000',
    description: 'Major Yakima tributary with quality wild trout. Little Naches offers small stream fishing.'
  },
  {
    name: 'Rocky Ford Creek',
    type: 'stream',
    state: 'WA',
    city: 'Ephrata',
    latitude: 47.3017,
    longitude: -119.4500,
    species: ['rainbow trout'],
    description: 'World-class spring creek with trophy rainbows averaging 18-22 inches. Selective gear rules, catch and release only.'
  },
  {
    name: 'Crab Creek',
    type: 'creek',
    state: 'WA',
    city: 'Moses Lake',
    latitude: 47.1169,
    longitude: -119.2778,
    species: ['rainbow trout', 'brown trout', 'largemouth bass'],
    description: 'Columbia Basin stream with spring creek sections. Quality trout in upper reaches.'
  },
  {
    name: 'Methow River',
    type: 'river',
    state: 'WA',
    city: 'Winthrop',
    latitude: 48.4733,
    longitude: -120.1856,
    species: ['rainbow trout', 'cutthroat trout', 'steelhead', 'chinook salmon'],
    usgs_site_id: '12449500',
    description: 'Beautiful Okanogan valley river with wild trout and recovering steelhead. Cold, clear water year-round.'
  },
  {
    name: 'Wenatchee River',
    type: 'river',
    state: 'WA',
    city: 'Leavenworth',
    latitude: 47.5961,
    longitude: -120.6608,
    species: ['rainbow trout', 'cutthroat trout', 'steelhead', 'chinook salmon', 'mountain whitefish'],
    usgs_site_id: '12462500',
    description: 'Scenic river through Bavarian-themed Leavenworth. Wild trout and salmon runs.'
  },
  {
    name: 'Entiat River',
    type: 'river',
    state: 'WA',
    city: 'Entiat',
    latitude: 47.6731,
    longitude: -120.5278,
    species: ['rainbow trout', 'cutthroat trout', 'steelhead', 'chinook salmon'],
    description: 'Small Columbia tributary with wild trout in upper reaches. Remote fishing experience.'
  },
  {
    name: 'Okanogan River',
    type: 'river',
    state: 'WA',
    city: 'Okanogan',
    latitude: 48.3622,
    longitude: -119.5856,
    species: ['rainbow trout', 'smallmouth bass', 'steelhead', 'chinook salmon'],
    usgs_site_id: '12447390',
    description: 'Large river from Canada with recovering steelhead runs. Warm summer temps favor bass.'
  },
  {
    name: 'Spokane River',
    type: 'river',
    state: 'WA',
    city: 'Spokane',
    latitude: 47.6589,
    longitude: -117.4256,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout', 'mountain whitefish'],
    usgs_site_id: '12422500',
    description: 'Urban river with quality trout fishing. Below dam sections offer best opportunities.'
  },
  {
    name: 'Little Spokane River',
    type: 'river',
    state: 'WA',
    city: 'Spokane',
    latitude: 47.8089,
    longitude: -117.5022,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    description: 'Small stream north of Spokane with wild trout. Catch and release section near mouth.'
  },
  {
    name: 'Grande Ronde River',
    type: 'river',
    state: 'WA',
    city: 'Anatone',
    latitude: 46.1086,
    longitude: -117.0628,
    species: ['steelhead', 'rainbow trout', 'smallmouth bass', 'chinook salmon'],
    usgs_site_id: '13333000',
    description: 'Remote canyon river in SE Washington. Excellent wild steelhead and smallmouth bass.'
  },
  {
    name: 'Tucannon River',
    type: 'river',
    state: 'WA',
    city: 'Pomeroy',
    latitude: 46.4681,
    longitude: -117.5917,
    species: ['steelhead', 'rainbow trout', 'chinook salmon'],
    description: 'Blue Mountains stream with wild steelhead. Upper reaches offer resident trout.'
  },
  {
    name: 'Touchet River',
    type: 'river',
    state: 'WA',
    city: 'Dayton',
    latitude: 46.3233,
    longitude: -117.9742,
    species: ['rainbow trout', 'steelhead', 'mountain whitefish'],
    description: 'Small Blue Mountains river with wild trout. North and South forks offer quality fishing.'
  },

  // WASHINGTON LAKES
  {
    name: 'Lake Chelan',
    type: 'lake',
    state: 'WA',
    city: 'Chelan',
    latitude: 47.8397,
    longitude: -120.0167,
    species: ['rainbow trout', 'kokanee salmon', 'chinook salmon', 'lake trout', 'cutthroat trout'],
    description: 'Deepest lake in Washington (1,486 ft). Excellent kokanee and trout trolling. Remote upper lake access by boat or seaplane.'
  },
  {
    name: 'Banks Lake',
    type: 'lake',
    state: 'WA',
    city: 'Electric City',
    latitude: 47.9347,
    longitude: -119.1583,
    species: ['rainbow trout', 'walleye', 'smallmouth bass', 'largemouth bass', 'kokanee salmon'],
    description: 'Columbia Basin reservoir with excellent stillwater fishing. Trophy walleye and quality trout.'
  },
  {
    name: 'Dry Falls Lake',
    type: 'lake',
    state: 'WA',
    city: 'Coulee City',
    latitude: 47.5833,
    longitude: -119.3833,
    species: ['rainbow trout', 'brown trout'],
    description: 'Premier selective gear lake in Sun Lakes State Park. Quality trout 16-20 inches.'
  },
  {
    name: 'Lenice Lake',
    type: 'lake',
    state: 'WA',
    city: 'Ephrata',
    latitude: 47.0833,
    longitude: -119.3667,
    species: ['rainbow trout', 'brown trout'],
    description: 'Quality waters selective gear lake. March-June prime season for chironomid fishing.'
  },
  {
    name: 'Nunnally Lake',
    type: 'lake',
    state: 'WA',
    city: 'Ephrata',
    latitude: 47.0667,
    longitude: -119.3833,
    species: ['rainbow trout', 'brown trout'],
    description: 'Walk-in quality waters lake. Excellent damselfly and callibaetis hatches.'
  },
  {
    name: 'Merry Lake',
    type: 'lake',
    state: 'WA',
    city: 'Ephrata',
    latitude: 47.0500,
    longitude: -119.4000,
    species: ['rainbow trout', 'brown trout'],
    description: 'Third in the Seep Lakes chain. Quality fishing with fewer crowds.'
  },
  {
    name: 'Lake Lenore',
    type: 'lake',
    state: 'WA',
    city: 'Soap Lake',
    latitude: 47.5000,
    longitude: -119.5167,
    species: ['lahontan cutthroat trout'],
    description: 'Alkaline lake with trophy Lahontan cutthroat. Unique fishery with fish to 10+ pounds.'
  },
  {
    name: 'Pass Lake',
    type: 'lake',
    state: 'WA',
    city: 'Anacortes',
    latitude: 48.4500,
    longitude: -122.6167,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    description: 'Selective gear lake on Fidalgo Island. Fly fishing only. Quality fish year-round.'
  },
  {
    name: 'Chopaka Lake',
    type: 'lake',
    state: 'WA',
    city: 'Loomis',
    latitude: 48.9333,
    longitude: -119.7167,
    species: ['rainbow trout'],
    description: 'Remote fly fishing only lake near Canadian border. Trophy rainbows in beautiful setting.'
  },
  {
    name: 'Lake Cassidy',
    type: 'lake',
    state: 'WA',
    city: 'Marysville',
    latitude: 48.0667,
    longitude: -122.1000,
    species: ['rainbow trout', 'kokanee salmon', 'largemouth bass'],
    description: 'Lowland lake with quality trout stocking. Good year-round fishing.'
  },
  {
    name: 'American Lake',
    type: 'lake',
    state: 'WA',
    city: 'Lakewood',
    latitude: 47.1400,
    longitude: -122.5328,
    species: ['rainbow trout', 'cutthroat trout', 'kokanee salmon', 'largemouth bass'],
    description: 'Large Puget Sound lowland lake with diverse fishery. Consistent trout stocking.'
  },
  {
    name: 'Lake Washington',
    type: 'lake',
    state: 'WA',
    city: 'Seattle',
    latitude: 47.6167,
    longitude: -122.2500,
    species: ['rainbow trout', 'cutthroat trout', 'smallmouth bass', 'largemouth bass', 'sockeye salmon'],
    description: 'Seattle\'s urban lake with surprising fish diversity. Cutthroat near river mouths.'
  },
  {
    name: 'Lake Sammamish',
    type: 'lake',
    state: 'WA',
    city: 'Issaquah',
    latitude: 47.5833,
    longitude: -122.0667,
    species: ['rainbow trout', 'cutthroat trout', 'kokanee salmon', 'smallmouth bass'],
    description: 'Eastside suburban lake with quality kokanee fishing. Native cutthroat in tributaries.'
  },
  {
    name: 'Amber Lake',
    type: 'lake',
    state: 'WA',
    city: 'Cheney',
    latitude: 47.3333,
    longitude: -117.6833,
    species: ['rainbow trout', 'tiger trout'],
    description: 'Eastern Washington quality waters lake. Trophy tiger trout stocked.'
  },
  {
    name: 'Medical Lake',
    type: 'lake',
    state: 'WA',
    city: 'Medical Lake',
    latitude: 47.5667,
    longitude: -117.6833,
    species: ['rainbow trout'],
    description: 'Mineral lake with quality trout fishing. Good spring and fall seasons.'
  },
  {
    name: 'Rufus Woods Lake',
    type: 'lake',
    state: 'WA',
    city: 'Bridgeport',
    latitude: 47.9500,
    longitude: -119.6000,
    species: ['rainbow trout', 'kokanee salmon', 'walleye'],
    description: 'Columbia River reservoir famous for trophy triploid rainbows over 20 pounds.'
  },
  {
    name: 'Lake Roosevelt',
    type: 'lake',
    state: 'WA',
    city: 'Kettle Falls',
    latitude: 48.1667,
    longitude: -118.0833,
    species: ['rainbow trout', 'walleye', 'kokanee salmon', 'smallmouth bass', 'sturgeon'],
    description: 'Massive 130+ mile Columbia River reservoir. Diverse fishing opportunities year-round.'
  },
  {
    name: 'Omak Lake',
    type: 'lake',
    state: 'WA',
    city: 'Omak',
    latitude: 48.1833,
    longitude: -119.5000,
    species: ['lahontan cutthroat trout'],
    description: 'Colville tribal lake with trophy Lahontan cutthroat. Tribal permit required.'
  },
];

// ============================================
// OTHER POPULAR FLY FISHING DESTINATIONS
// ============================================

const nationalWaters: WaterBody[] = [
  // MONTANA - The crown jewels of Western fly fishing
  {
    name: 'Madison River',
    type: 'river',
    state: 'MT',
    city: 'Ennis',
    latitude: 45.3494,
    longitude: -111.7288,
    species: ['rainbow trout', 'brown trout', 'mountain whitefish'],
    usgs_site_id: '06041000',
    description: 'Legendary freestone with 50+ miles of blue-ribbon water. Famous salmonfly hatch in June. Wade and float fishing.'
  },
  {
    name: 'Yellowstone River',
    type: 'river',
    state: 'MT',
    city: 'Livingston',
    latitude: 45.6619,
    longitude: -110.5600,
    species: ['cutthroat trout', 'rainbow trout', 'brown trout', 'mountain whitefish'],
    usgs_site_id: '06192500',
    description: 'Longest undammed river in the lower 48. Outstanding dry fly fishing through Paradise Valley.'
  },
  {
    name: 'Big Hole River',
    type: 'river',
    state: 'MT',
    city: 'Wise River',
    latitude: 45.7933,
    longitude: -113.4833,
    species: ['rainbow trout', 'brown trout', 'arctic grayling', 'brook trout'],
    usgs_site_id: '06024540',
    description: 'One of the last Lower 48 rivers with native arctic grayling. Excellent hatches and solitude.'
  },
  {
    name: 'Missouri River',
    type: 'river',
    state: 'MT',
    city: 'Craig',
    latitude: 47.1786,
    longitude: -111.8608,
    species: ['rainbow trout', 'brown trout'],
    usgs_site_id: '06066500',
    description: 'Prolific tailwater averaging 5,000+ fish per mile. Incredible midge and PMD hatches.'
  },
  {
    name: 'Gallatin River',
    type: 'river',
    state: 'MT',
    city: 'Big Sky',
    latitude: 45.2836,
    longitude: -111.3000,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout', 'mountain whitefish'],
    usgs_site_id: '06043500',
    description: 'Beautiful freestone from A River Runs Through It. Pocket water with quality fish.'
  },
  {
    name: 'Bighorn River',
    type: 'river',
    state: 'MT',
    city: 'Fort Smith',
    latitude: 45.3147,
    longitude: -107.9331,
    species: ['rainbow trout', 'brown trout'],
    usgs_site_id: '06287000',
    description: 'World-class tailwater with trophy browns over 20 inches. Consistent fishing year-round.'
  },
  {
    name: 'Rock Creek',
    type: 'river',
    state: 'MT',
    city: 'Clinton',
    latitude: 46.7667,
    longitude: -113.7167,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout', 'brook trout', 'bull trout'],
    description: 'Classic Montana freestone near Missoula. Great salmonfly and caddis hatches.'
  },
  {
    name: 'Bitterroot River',
    type: 'river',
    state: 'MT',
    city: 'Hamilton',
    latitude: 46.2458,
    longitude: -114.1617,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout', 'bull trout'],
    usgs_site_id: '12352500',
    description: 'Beautiful valley river with excellent public access. Diverse fishing from tribs to mainstem.'
  },
  {
    name: 'Blackfoot River',
    type: 'river',
    state: 'MT',
    city: 'Missoula',
    latitude: 46.8833,
    longitude: -113.9833,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout', 'bull trout'],
    usgs_site_id: '12340500',
    description: 'A River Runs Through It fame. Restored fishery with wild trout and bull trout.'
  },
  {
    name: 'Clark Fork River',
    type: 'river',
    state: 'MT',
    city: 'Missoula',
    latitude: 46.8719,
    longitude: -114.0028,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout', 'bull trout'],
    usgs_site_id: '12340000',
    description: 'Western Montana\'s largest river. Excellent hatches and diverse water types.'
  },
  {
    name: 'Smith River',
    type: 'river',
    state: 'MT',
    city: 'White Sulphur Springs',
    latitude: 46.5489,
    longitude: -110.9017,
    species: ['rainbow trout', 'brown trout'],
    description: 'Permit-only multi-day float through limestone canyon. Unforgettable experience.'
  },

  // IDAHO - Springs, freestones, and steelhead
  {
    name: 'Henry\'s Fork',
    type: 'river',
    state: 'ID',
    city: 'Island Park',
    latitude: 44.4175,
    longitude: -111.3928,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    usgs_site_id: '13042500',
    description: 'Technical spring creek fishing at Railroad Ranch. Box Canyon offers faster water. World-famous hatches.'
  },
  {
    name: 'Silver Creek',
    type: 'stream',
    state: 'ID',
    city: 'Picabo',
    latitude: 43.3075,
    longitude: -114.1417,
    species: ['rainbow trout', 'brown trout'],
    description: 'World-famous spring creek owned by Nature Conservancy. Challenging sight fishing to large, wary trout.'
  },
  {
    name: 'South Fork Snake River',
    type: 'river',
    state: 'ID',
    city: 'Idaho Falls',
    latitude: 43.4917,
    longitude: -111.9833,
    species: ['cutthroat trout', 'brown trout', 'rainbow trout'],
    usgs_site_id: '13037500',
    description: 'Blue-ribbon tailwater with native Yellowstone cutthroat. Massive hatches and trophy fish.'
  },
  {
    name: 'Big Wood River',
    type: 'river',
    state: 'ID',
    city: 'Ketchum',
    latitude: 43.6808,
    longitude: -114.3636,
    species: ['rainbow trout', 'brown trout', 'brook trout'],
    description: 'Sun Valley\'s home water. Quality freestone fishing with easy access.'
  },
  {
    name: 'Salmon River',
    type: 'river',
    state: 'ID',
    city: 'Stanley',
    latitude: 44.2194,
    longitude: -114.9333,
    species: ['steelhead', 'chinook salmon', 'cutthroat trout', 'rainbow trout', 'bull trout'],
    usgs_site_id: '13302500',
    description: 'The River of No Return. Remote wilderness fishing with steelhead, salmon, and trout.'
  },
  {
    name: 'Middle Fork Salmon River',
    type: 'river',
    state: 'ID',
    city: 'Stanley',
    latitude: 44.6833,
    longitude: -115.2167,
    species: ['cutthroat trout', 'rainbow trout', 'bull trout', 'steelhead', 'chinook salmon'],
    description: 'Wild and scenic river accessible only by permit float trip. Pristine wilderness fishing.'
  },
  {
    name: 'Clearwater River',
    type: 'river',
    state: 'ID',
    city: 'Orofino',
    latitude: 46.4744,
    longitude: -116.2556,
    species: ['steelhead', 'rainbow trout', 'cutthroat trout', 'chinook salmon'],
    usgs_site_id: '13340000',
    description: 'Premier steelhead river with B-run fish over 15 pounds. North Fork offers trout fishing.'
  },

  // WYOMING - Yellowstone country
  {
    name: 'North Platte River',
    type: 'river',
    state: 'WY',
    city: 'Saratoga',
    latitude: 41.4511,
    longitude: -106.8067,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    usgs_site_id: '06620000',
    description: 'Miracle Mile and Gray Reef tailwaters offer trophy trout. Freestone sections have wild fish.'
  },
  {
    name: 'Snake River',
    type: 'river',
    state: 'WY',
    city: 'Jackson',
    latitude: 43.4799,
    longitude: -110.7624,
    species: ['cutthroat trout', 'brown trout', 'rainbow trout', 'mountain whitefish'],
    usgs_site_id: '13022500',
    description: 'Grand Teton scenery with native Snake River fine-spotted cutthroat. Float fishing paradise.'
  },
  {
    name: 'Green River',
    type: 'river',
    state: 'WY',
    city: 'Pinedale',
    latitude: 42.8661,
    longitude: -109.8614,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout', 'mountain whitefish'],
    usgs_site_id: '09188500',
    description: 'Remote freestone with excellent hatches. Below Fontenelle and Flaming Gorge offers tailwater fishing.'
  },
  {
    name: 'Firehole River',
    type: 'river',
    state: 'WY',
    city: 'Yellowstone',
    latitude: 44.6489,
    longitude: -110.8578,
    species: ['rainbow trout', 'brown trout', 'brook trout'],
    description: 'Unique geothermally-heated river in Yellowstone. Excellent hatches but warm summer temps close fishing.'
  },
  {
    name: 'Gibbon River',
    type: 'river',
    state: 'WY',
    city: 'Yellowstone',
    latitude: 44.6847,
    longitude: -110.7364,
    species: ['rainbow trout', 'brown trout', 'brook trout', 'grayling'],
    description: 'Yellowstone meadow stream with arctic grayling. Excellent dry fly fishing.'
  },
  {
    name: 'Lamar River',
    type: 'river',
    state: 'WY',
    city: 'Yellowstone',
    latitude: 44.8931,
    longitude: -110.2094,
    species: ['cutthroat trout'],
    description: 'Yellowstone\'s premier native cutthroat stream. Remote fishing in wolf and bison country.'
  },
  {
    name: 'Slough Creek',
    type: 'creek',
    state: 'WY',
    city: 'Yellowstone',
    latitude: 44.9278,
    longitude: -110.3500,
    species: ['cutthroat trout'],
    description: 'Meadow creek with large, selective cutthroat. First and second meadows require hiking.'
  },

  // COLORADO - High altitude fishing
  {
    name: 'South Platte River',
    type: 'river',
    state: 'CO',
    city: 'Denver',
    latitude: 39.7392,
    longitude: -104.9903,
    species: ['rainbow trout', 'brown trout'],
    usgs_site_id: '06710500',
    description: 'Denver\'s urban tailwater with technical fishing. Cheesman Canyon offers world-class challenge.'
  },
  {
    name: 'Arkansas River',
    type: 'river',
    state: 'CO',
    city: 'Buena Vista',
    latitude: 38.8422,
    longitude: -106.1311,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    usgs_site_id: '07091200',
    description: 'Gold Medal water from Leadville to Canon City. Diverse hatches and beautiful scenery.'
  },
  {
    name: 'Fryingpan River',
    type: 'river',
    state: 'CO',
    city: 'Basalt',
    latitude: 39.3689,
    longitude: -106.8431,
    species: ['rainbow trout', 'brown trout'],
    usgs_site_id: '09080400',
    description: 'World-class tailwater with fish averaging 16-20 inches. Mysis shrimp and hatches.'
  },
  {
    name: 'Blue River',
    type: 'river',
    state: 'CO',
    city: 'Silverthorne',
    latitude: 39.6344,
    longitude: -106.0706,
    species: ['rainbow trout', 'brown trout', 'brook trout'],
    description: 'Beautiful mountain tailwater below Dillon Reservoir. Gold Medal water through canyon.'
  },
  {
    name: 'Roaring Fork River',
    type: 'river',
    state: 'CO',
    city: 'Aspen',
    latitude: 39.1911,
    longitude: -106.8175,
    species: ['rainbow trout', 'brown trout', 'brook trout', 'cutthroat trout'],
    usgs_site_id: '09085000',
    description: 'Aspen\'s freestone with excellent dry fly fishing. Gold Medal water from Basalt down.'
  },
  {
    name: 'Gunnison River',
    type: 'river',
    state: 'CO',
    city: 'Gunnison',
    latitude: 38.5458,
    longitude: -106.9253,
    species: ['rainbow trout', 'brown trout', 'kokanee salmon'],
    usgs_site_id: '09114500',
    description: 'Large volume Gold Medal river. Black Canyon offers remote, challenging fishing.'
  },
  {
    name: 'Colorado River',
    type: 'river',
    state: 'CO',
    city: 'Kremmling',
    latitude: 40.0589,
    longitude: -106.3892,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    usgs_site_id: '09058000',
    description: 'Diverse sections from headwaters to canyons. Gold Medal water with quality fishing.'
  },
  {
    name: 'Rio Grande',
    type: 'river',
    state: 'CO',
    city: 'South Fork',
    latitude: 37.6714,
    longitude: -106.6417,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    usgs_site_id: '08220000',
    description: 'Southern Colorado headwaters with wild trout. Del Norte to South Fork is Gold Medal.'
  },

  // OREGON - Volcanic springs and steelhead
  {
    name: 'Deschutes River',
    type: 'river',
    state: 'OR',
    city: 'Maupin',
    latitude: 45.1756,
    longitude: -121.0833,
    species: ['rainbow trout', 'steelhead', 'brown trout'],
    usgs_site_id: '14103000',
    description: 'High desert tailwater with legendary redside rainbows. World-class steelhead and salmonfly hatches.'
  },
  {
    name: 'Metolius River',
    type: 'river',
    state: 'OR',
    city: 'Camp Sherman',
    latitude: 44.4606,
    longitude: -121.6344,
    species: ['rainbow trout', 'bull trout', 'brook trout', 'kokanee salmon'],
    description: 'Crystal-clear spring creek flowing from base of Black Butte. Challenging sight fishing.'
  },
  {
    name: 'McKenzie River',
    type: 'river',
    state: 'OR',
    city: 'Blue River',
    latitude: 44.1631,
    longitude: -122.3339,
    species: ['rainbow trout', 'cutthroat trout', 'bull trout'],
    usgs_site_id: '14162500',
    description: 'Beautiful Cascade freestone with native redsides. October caddis and spring stoneflies.'
  },
  {
    name: 'Crooked River',
    type: 'river',
    state: 'OR',
    city: 'Prineville',
    latitude: 44.3011,
    longitude: -120.8511,
    species: ['rainbow trout', 'brown trout', 'mountain whitefish'],
    usgs_site_id: '14087400',
    description: 'Central Oregon tailwater with consistent year-round fishing. Excellent midge hatches.'
  },
  {
    name: 'North Umpqua River',
    type: 'river',
    state: 'OR',
    city: 'Roseburg',
    latitude: 43.2767,
    longitude: -123.3408,
    species: ['steelhead', 'rainbow trout', 'chinook salmon'],
    usgs_site_id: '14319500',
    description: 'Legendary summer steelhead water. Camp Water fly-only section is iconic.'
  },
  {
    name: 'Fall River',
    type: 'river',
    state: 'OR',
    city: 'La Pine',
    latitude: 43.7833,
    longitude: -121.6333,
    species: ['rainbow trout', 'brook trout', 'brown trout'],
    description: 'Spring creek with challenging fishing. Wild trout in clear, weedy water.'
  },

  // CALIFORNIA - Eastern Sierra and beyond
  {
    name: 'Fall River',
    type: 'river',
    state: 'CA',
    city: 'McArthur',
    latitude: 41.0456,
    longitude: -121.4228,
    species: ['rainbow trout', 'brown trout'],
    description: 'Premier spring creek with trophy trout. Float tubes only, wading prohibited.'
  },
  {
    name: 'Hot Creek',
    type: 'stream',
    state: 'CA',
    city: 'Mammoth Lakes',
    latitude: 37.6611,
    longitude: -118.8267,
    species: ['rainbow trout', 'brown trout'],
    description: 'World-class spring creek in Eastern Sierra. Technically demanding sight fishing.'
  },
  {
    name: 'Owens River',
    type: 'river',
    state: 'CA',
    city: 'Bishop',
    latitude: 37.3639,
    longitude: -118.3967,
    species: ['brown trout', 'rainbow trout'],
    description: 'Technical spring creek with large, wary fish. Pleasant Valley section is famous.'
  },
  {
    name: 'McCloud River',
    type: 'river',
    state: 'CA',
    city: 'McCloud',
    latitude: 41.2556,
    longitude: -122.1400,
    species: ['rainbow trout', 'brown trout', 'brook trout'],
    description: 'Pristine freestone below Mt. Shasta. Native McCloud redband rainbow origin.'
  },
  {
    name: 'Truckee River',
    type: 'river',
    state: 'CA',
    city: 'Truckee',
    latitude: 39.3278,
    longitude: -120.1833,
    species: ['rainbow trout', 'brown trout'],
    usgs_site_id: '10346000',
    description: 'Lake Tahoe\'s outlet with excellent fishing. Quality trout in accessible water.'
  },
  {
    name: 'Hat Creek',
    type: 'creek',
    state: 'CA',
    city: 'Burney',
    latitude: 40.8833,
    longitude: -121.5333,
    species: ['rainbow trout', 'brown trout'],
    description: 'Wild trout section with technical spring creek fishing. Large hexagenia mayflies.'
  },
  {
    name: 'Lower Sacramento River',
    type: 'river',
    state: 'CA',
    city: 'Redding',
    latitude: 40.5865,
    longitude: -122.3917,
    species: ['rainbow trout', 'steelhead', 'chinook salmon'],
    usgs_site_id: '11377100',
    description: 'Premier California trout fishery. Tailwater with wild rainbows averaging 16-22 inches.'
  },

  // PENNSYLVANIA - Limestone spring creeks
  {
    name: 'Penns Creek',
    type: 'river',
    state: 'PA',
    city: 'Mifflinburg',
    latitude: 40.9253,
    longitude: -77.1133,
    species: ['brown trout', 'rainbow trout'],
    description: 'Pennsylvania\'s premier limestone creek with legendary green drake hatch in late May.'
  },
  {
    name: 'Little Juniata River',
    type: 'river',
    state: 'PA',
    city: 'Spruce Creek',
    latitude: 40.6275,
    longitude: -78.1372,
    species: ['brown trout', 'rainbow trout'],
    description: 'Beautiful limestone stream with excellent hatches. Spruce Creek tributary is world-famous.'
  },
  {
    name: 'Spring Creek',
    type: 'stream',
    state: 'PA',
    city: 'Bellefonte',
    latitude: 40.9128,
    longitude: -77.7786,
    species: ['brown trout', 'rainbow trout'],
    description: 'Classic Pennsylvania limestone spring creek. Excellent fishing through State College.'
  },
  {
    name: 'Yellow Breeches Creek',
    type: 'stream',
    state: 'PA',
    city: 'Boiling Springs',
    latitude: 40.1492,
    longitude: -77.1292,
    species: ['brown trout', 'rainbow trout'],
    description: 'Limestone creek with year-round fishing near Harrisburg. Sulphur hatches in spring.'
  },
  {
    name: 'Big Fishing Creek',
    type: 'creek',
    state: 'PA',
    city: 'Lamar',
    latitude: 41.0167,
    longitude: -77.4833,
    species: ['brown trout', 'rainbow trout', 'brook trout'],
    description: 'Premier Pennsylvania limestone stream. Wild trout throughout with excellent hatches.'
  },
  {
    name: 'Letort Spring Run',
    type: 'stream',
    state: 'PA',
    city: 'Carlisle',
    latitude: 40.2039,
    longitude: -77.1944,
    species: ['brown trout'],
    description: 'Historic spring creek where modern technical fly fishing developed. Very challenging.'
  },

  // NEW YORK - Catskills and Adirondacks
  {
    name: 'Delaware River',
    type: 'river',
    state: 'NY',
    city: 'Hancock',
    latitude: 41.9556,
    longitude: -75.2842,
    species: ['rainbow trout', 'brown trout'],
    description: 'East Coast\'s premier wild trout fishery. West Branch tailwater offers trophy fish.'
  },
  {
    name: 'Ausable River',
    type: 'river',
    state: 'NY',
    city: 'Wilmington',
    latitude: 44.3825,
    longitude: -73.8200,
    species: ['brown trout', 'rainbow trout', 'brook trout', 'landlocked salmon'],
    description: 'Beautiful Adirondack freestone with excellent hatches. West Branch is premier water.'
  },
  {
    name: 'Willowemoc Creek',
    type: 'stream',
    state: 'NY',
    city: 'Livingston Manor',
    latitude: 41.8981,
    longitude: -74.8233,
    species: ['brown trout', 'rainbow trout', 'brook trout'],
    description: 'Birthplace of American fly fishing. Historic Catskill water with wild trout.'
  },
  {
    name: 'Beaverkill River',
    type: 'river',
    state: 'NY',
    city: 'Roscoe',
    latitude: 41.9350,
    longitude: -74.9083,
    species: ['brown trout', 'rainbow trout', 'brook trout'],
    description: 'Legendary Catskill river with rich fly fishing history. Junction Pool is iconic.'
  },
  {
    name: 'Esopus Creek',
    type: 'creek',
    state: 'NY',
    city: 'Phoenicia',
    latitude: 42.0842,
    longitude: -74.3139,
    species: ['rainbow trout', 'brown trout', 'brook trout'],
    description: 'Catskill freestone with excellent rainbow fishing. Portal release provides cold water.'
  },

  // ARKANSAS - Southern tailwaters
  {
    name: 'White River',
    type: 'river',
    state: 'AR',
    city: 'Bull Shoals',
    latitude: 36.3833,
    longitude: -92.5833,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout', 'brook trout'],
    usgs_site_id: '07055680',
    description: 'Legendary Southern tailwater with trophy browns. Year-round fishing with incredible numbers.'
  },
  {
    name: 'Little Red River',
    type: 'river',
    state: 'AR',
    city: 'Heber Springs',
    latitude: 35.5167,
    longitude: -91.9833,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    usgs_site_id: '07076750',
    description: 'Former world record brown trout water (40 lbs 4 oz). Quality fishing below Greers Ferry Dam.'
  },
  {
    name: 'Norfork River',
    type: 'river',
    state: 'AR',
    city: 'Norfork',
    latitude: 36.2119,
    longitude: -92.2167,
    species: ['rainbow trout', 'brown trout'],
    description: 'Small but productive tailwater. Consistent fishing with excellent midge hatches.'
  },

  // NEW MEXICO - Desert tailwater
  {
    name: 'San Juan River',
    type: 'river',
    state: 'NM',
    city: 'Navajo Dam',
    latitude: 36.8058,
    longitude: -107.6500,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    usgs_site_id: '09355500',
    description: 'World-class tailwater with 15,000+ fish per mile. Year-round midge and baetis fishing.'
  },
  {
    name: 'Rio Grande',
    type: 'river',
    state: 'NM',
    city: 'Taos',
    latitude: 36.4072,
    longitude: -105.5733,
    species: ['brown trout', 'rainbow trout', 'cutthroat trout'],
    description: 'Remote canyon fishing with wild fish. Rio Grande Gorge offers stunning scenery.'
  },
  {
    name: 'Cimarron River',
    type: 'river',
    state: 'NM',
    city: 'Cimarron',
    latitude: 36.5103,
    longitude: -104.9156,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    description: 'Small canyon stream with wild trout. Colin Neblett Wildlife Area provides access.'
  },

  // TENNESSEE - Southern tailwaters
  {
    name: 'South Holston River',
    type: 'river',
    state: 'TN',
    city: 'Bristol',
    latitude: 36.5486,
    longitude: -82.0619,
    species: ['rainbow trout', 'brown trout'],
    description: 'Premier Southern tailwater with excellent sulphur hatches. Quality fish year-round.'
  },
  {
    name: 'Clinch River',
    type: 'river',
    state: 'TN',
    city: 'Norris',
    latitude: 36.2153,
    longitude: -84.0672,
    species: ['rainbow trout', 'brown trout'],
    description: 'Quality tailwater below Norris Dam. Excellent midge and caddis fishing.'
  },
  {
    name: 'Hiwassee River',
    type: 'river',
    state: 'TN',
    city: 'Delano',
    latitude: 35.3456,
    longitude: -84.5461,
    species: ['rainbow trout', 'brown trout'],
    description: 'Southern Appalachian tailwater with quality fish. Delayed harvest section is popular.'
  },

  // NORTH CAROLINA - Mountain freestones
  {
    name: 'Davidson River',
    type: 'river',
    state: 'NC',
    city: 'Brevard',
    latitude: 35.2808,
    longitude: -82.7856,
    species: ['rainbow trout', 'brown trout', 'brook trout'],
    description: 'Pisgah National Forest freestone with excellent access. Quality hatchery and wild fish.'
  },
  {
    name: 'Nantahala River',
    type: 'river',
    state: 'NC',
    city: 'Bryson City',
    latitude: 35.3342,
    longitude: -83.6089,
    species: ['rainbow trout', 'brown trout'],
    description: 'Scenic river with delayed harvest sections. Consistent cold water from dam releases.'
  },

  // UTAH - Desert oases
  {
    name: 'Green River',
    type: 'river',
    state: 'UT',
    city: 'Dutch John',
    latitude: 40.9286,
    longitude: -109.4083,
    species: ['rainbow trout', 'brown trout', 'cutthroat trout'],
    usgs_site_id: '09234500',
    description: 'Blue-ribbon tailwater below Flaming Gorge. A Section offers trophy fishing.'
  },
  {
    name: 'Provo River',
    type: 'river',
    state: 'UT',
    city: 'Heber City',
    latitude: 40.5072,
    longitude: -111.4133,
    species: ['brown trout', 'rainbow trout', 'cutthroat trout'],
    usgs_site_id: '10155500',
    description: 'Three distinct sections with quality fishing. Middle Provo is blue-ribbon water.'
  },
  {
    name: 'Weber River',
    type: 'river',
    state: 'UT',
    city: 'Oakley',
    latitude: 40.7153,
    longitude: -111.2972,
    species: ['brown trout', 'rainbow trout', 'mountain whitefish'],
    usgs_site_id: '10128500',
    description: 'Blue Ribbon fishery near Park City. Lower section offers excellent brown trout.'
  },
  {
    name: 'Logan River',
    type: 'river',
    state: 'UT',
    city: 'Logan',
    latitude: 41.7353,
    longitude: -111.8350,
    species: ['brown trout', 'rainbow trout', 'cutthroat trout'],
    description: 'Northern Utah freestone with wild fish. Canyon section is most productive.'
  },

  // MICHIGAN - Great Lakes tributaries
  {
    name: 'Au Sable River',
    type: 'river',
    state: 'MI',
    city: 'Grayling',
    latitude: 44.6608,
    longitude: -84.7147,
    species: ['brown trout', 'brook trout', 'rainbow trout'],
    usgs_site_id: '04137500',
    description: 'Historic Michigan river, birthplace of Trout Unlimited. Holy Waters section is legendary.'
  },
  {
    name: 'Pere Marquette River',
    type: 'river',
    state: 'MI',
    city: 'Baldwin',
    latitude: 43.9011,
    longitude: -85.8517,
    species: ['brown trout', 'steelhead', 'salmon', 'rainbow trout'],
    usgs_site_id: '04122500',
    description: 'Year-round fishing with steelhead, salmon, and resident trout. Flies-only section.'
  },
  {
    name: 'Manistee River',
    type: 'river',
    state: 'MI',
    city: 'Mesick',
    latitude: 44.4150,
    longitude: -85.7133,
    species: ['brown trout', 'rainbow trout', 'steelhead', 'salmon'],
    usgs_site_id: '04124000',
    description: 'Large freestone with diverse opportunities. Upper river has wild trout, lower has runs.'
  },

  // VERMONT - New England charm
  {
    name: 'Battenkill River',
    type: 'river',
    state: 'VT',
    city: 'Manchester',
    latitude: 43.1589,
    longitude: -73.0708,
    species: ['brown trout', 'brook trout'],
    usgs_site_id: '01334500',
    description: 'Classic New England freestone with wild trout. Home of Orvis and American fly fishing history.'
  },
  {
    name: 'White River',
    type: 'river',
    state: 'VT',
    city: 'Bethel',
    latitude: 43.8350,
    longitude: -72.6344,
    species: ['rainbow trout', 'brown trout', 'brook trout'],
    description: 'Vermont\'s best trout river with excellent access. First Branch is outstanding small stream.'
  },
  {
    name: 'Mettawee River',
    type: 'river',
    state: 'VT',
    city: 'Pawlet',
    latitude: 43.3500,
    longitude: -73.1833,
    species: ['brown trout', 'brook trout'],
    description: 'Small freestone with wild trout populations. Underrated and lightly fished.'
  },

  // CONNECTICUT
  {
    name: 'Farmington River',
    type: 'river',
    state: 'CT',
    city: 'Pleasant Valley',
    latitude: 41.9419,
    longitude: -73.0056,
    species: ['brown trout', 'rainbow trout', 'atlantic salmon'],
    usgs_site_id: '01186000',
    description: 'Premier Connecticut trout stream with TMA section. Wild browns and stocked atlantics.'
  },
  {
    name: 'Housatonic River',
    type: 'river',
    state: 'CT',
    city: 'Cornwall',
    latitude: 41.8419,
    longitude: -73.3639,
    species: ['brown trout', 'rainbow trout'],
    description: 'Excellent freestone with trophy browns. TMA water from Cornwall Bridge to Falls Village.'
  },

  // MASSACHUSETTS
  {
    name: 'Deerfield River',
    type: 'river',
    state: 'MA',
    city: 'Charlemont',
    latitude: 42.6286,
    longitude: -72.8708,
    species: ['rainbow trout', 'brown trout', 'brook trout'],
    description: 'Massachusetts\' best trout river with tailwater and freestone sections.'
  },
  {
    name: 'Swift River',
    type: 'river',
    state: 'MA',
    city: 'Belchertown',
    latitude: 42.2797,
    longitude: -72.3461,
    species: ['rainbow trout', 'brown trout'],
    description: 'Year-round catch and release tailwater. Consistent fishing with quality fish.'
  },

  // WEST VIRGINIA
  {
    name: 'Elk River',
    type: 'river',
    state: 'WV',
    city: 'Slatyfork',
    latitude: 38.4167,
    longitude: -80.0667,
    species: ['rainbow trout', 'brown trout', 'brook trout'],
    description: 'Mountain freestone with native brookies in headwaters. Quality wild trout fishing.'
  },
  {
    name: 'Cranberry River',
    type: 'river',
    state: 'WV',
    city: 'Richwood',
    latitude: 38.2167,
    longitude: -80.4833,
    species: ['brook trout', 'rainbow trout'],
    description: 'Remote wilderness stream in Monongahela NF. Native brook trout in upper reaches.'
  },
  {
    name: 'Shavers Fork',
    type: 'river',
    state: 'WV',
    city: 'Elkins',
    latitude: 38.8833,
    longitude: -79.8333,
    species: ['brook trout', 'rainbow trout', 'brown trout'],
    description: 'High-elevation freestone with wild trout. Remote upper section has native brookies.'
  },

  // VIRGINIA
  {
    name: 'Jackson River',
    type: 'river',
    state: 'VA',
    city: 'Covington',
    latitude: 37.7942,
    longitude: -79.9939,
    species: ['rainbow trout', 'brown trout'],
    description: 'Virginia\'s best tailwater fishery. Quality fish below Gathright Dam.'
  },
  {
    name: 'Smith River',
    type: 'river',
    state: 'VA',
    city: 'Bassett',
    latitude: 36.7686,
    longitude: -79.9908,
    species: ['brown trout', 'rainbow trout'],
    description: 'Quality tailwater in Southern Virginia. Excellent midge and caddis fishing.'
  },
  {
    name: 'Mossy Creek',
    type: 'creek',
    state: 'VA',
    city: 'Bridgewater',
    latitude: 38.3833,
    longitude: -79.0000,
    species: ['brown trout', 'rainbow trout'],
    description: 'Trophy spring creek in Shenandoah Valley. Challenging sight fishing to large fish.'
  },

  // GEORGIA
  {
    name: 'Chattahoochee River',
    type: 'river',
    state: 'GA',
    city: 'Atlanta',
    latitude: 33.8792,
    longitude: -84.4561,
    species: ['rainbow trout', 'brown trout'],
    description: 'Urban tailwater with year-round cold water. Quality fishing minutes from downtown Atlanta.'
  },
  {
    name: 'Toccoa River',
    type: 'river',
    state: 'GA',
    city: 'Blue Ridge',
    latitude: 34.8642,
    longitude: -84.3242,
    species: ['rainbow trout', 'brown trout'],
    description: 'Quality tailwater in north Georgia mountains. Excellent fishing below Blue Ridge Dam.'
  },

  // ARIZONA
  {
    name: 'Lee\'s Ferry',
    type: 'river',
    state: 'AZ',
    city: 'Marble Canyon',
    latitude: 36.8653,
    longitude: -111.5892,
    species: ['rainbow trout', 'brown trout'],
    usgs_site_id: '09380000',
    description: 'World-class tailwater below Glen Canyon Dam. Trophy rainbows in 15-mile reach.'
  },
  {
    name: 'Oak Creek',
    type: 'creek',
    state: 'AZ',
    city: 'Sedona',
    latitude: 34.8697,
    longitude: -111.7608,
    species: ['rainbow trout', 'brown trout'],
    description: 'Desert creek through red rock country. Unique setting with stocked and wild trout.'
  },

  // MAINE
  {
    name: 'Kennebec River',
    type: 'river',
    state: 'ME',
    city: 'The Forks',
    latitude: 45.3542,
    longitude: -69.9681,
    species: ['landlocked salmon', 'brook trout', 'brown trout', 'rainbow trout'],
    usgs_site_id: '01049265',
    description: 'Large river with landlocked salmon. Excellent fishing below Harris Dam.'
  },
  {
    name: 'Rapid River',
    type: 'river',
    state: 'ME',
    city: 'Upton',
    latitude: 44.8333,
    longitude: -70.8833,
    species: ['brook trout', 'landlocked salmon'],
    description: 'Remote stream with wild brook trout and salmon. Fly fishing only, catch and release.'
  },
  {
    name: 'Kennebago River',
    type: 'river',
    state: 'ME',
    city: 'Rangeley',
    latitude: 45.0833,
    longitude: -70.8167,
    species: ['brook trout', 'landlocked salmon'],
    description: 'Premier Maine brook trout water. Fly fishing only with trophy fish potential.'
  },

  // ALASKA - Wilderness fishing
  {
    name: 'Kenai River',
    type: 'river',
    state: 'AK',
    city: 'Cooper Landing',
    latitude: 60.4911,
    longitude: -149.8300,
    species: ['rainbow trout', 'king salmon', 'sockeye salmon', 'dolly varden', 'arctic char'],
    usgs_site_id: '15266300',
    description: 'World-famous salmon and trout fishery. Trophy rainbows and multiple salmon runs.'
  },
  {
    name: 'Bristol Bay Rivers',
    type: 'river',
    state: 'AK',
    city: 'King Salmon',
    latitude: 58.6833,
    longitude: -156.6500,
    species: ['rainbow trout', 'arctic char', 'salmon', 'arctic grayling'],
    description: 'Remote wilderness fishing at its finest. Multiple rivers including Naknek, Kvichak, and Alagnak.'
  },
  {
    name: 'Togiak River',
    type: 'river',
    state: 'AK',
    city: 'Dillingham',
    latitude: 59.0833,
    longitude: -160.4167,
    species: ['rainbow trout', 'arctic char', 'salmon', 'arctic grayling', 'dolly varden'],
    description: 'Wild and scenic river with incredible fishing diversity. Remote fly-out access.'
  },
  {
    name: 'Copper River',
    type: 'river',
    state: 'AK',
    city: 'Glennallen',
    latitude: 61.4972,
    longitude: -145.5417,
    species: ['rainbow trout', 'sockeye salmon', 'king salmon', 'dolly varden'],
    description: 'Large glacial system with famous salmon runs. Tributaries offer clear water fishing.'
  },

  // NEVADA - Desert trophy
  {
    name: 'Pyramid Lake',
    type: 'lake',
    state: 'NV',
    city: 'Nixon',
    latitude: 40.0000,
    longitude: -119.5000,
    species: ['lahontan cutthroat trout', 'sacramento perch'],
    description: 'Desert lake with trophy Lahontan cutthroat to 20+ pounds. Unique ladder fishing in fall/winter.'
  },
  {
    name: 'Truckee River',
    type: 'river',
    state: 'NV',
    city: 'Reno',
    latitude: 39.5294,
    longitude: -119.8128,
    species: ['rainbow trout', 'brown trout'],
    usgs_site_id: '10348000',
    description: 'Urban fishery through downtown Reno. Quality trout in tailwater section.'
  },
];

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function seedWaterBodies() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing environment variables');
    console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nSet these in your environment or .env file:');
    console.error('  export SUPABASE_URL="your-project-url"');
    console.error('  export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Starting water bodies seed...');
  console.log(`Washington waters: ${washingtonWaters.length}`);
  console.log(`National waters: ${nationalWaters.length}`);
  console.log(`Total waters to seed: ${washingtonWaters.length + nationalWaters.length}`);
  console.log('');

  // Combine all waters, prioritizing Washington
  const allWaters = [...washingtonWaters, ...nationalWaters];

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const water of allWaters) {
    try {
      // Check if water body already exists
      const { data: existing } = await supabase
        .from('water_bodies')
        .select('id')
        .eq('name', water.name)
        .eq('state', water.state)
        .single();

      if (existing) {
        console.log(`Skipped (exists): ${water.name}, ${water.state}`);
        skipped++;
        continue;
      }

      // Insert new water body
      const { error } = await supabase
        .from('water_bodies')
        .insert({
          name: water.name,
          type: water.type,
          state: water.state,
          city: water.city,
          latitude: water.latitude,
          longitude: water.longitude,
          species: water.species,
          usgs_site_id: water.usgs_site_id || null,
          description: water.description,
        });

      if (error) {
        console.error(`Error inserting ${water.name}: ${error.message}`);
        errors++;
      } else {
        console.log(`Inserted: ${water.name}, ${water.state}`);
        inserted++;
      }
    } catch (err) {
      console.error(`Exception for ${water.name}:`, err);
      errors++;
    }
  }

  console.log('\n========================================');
  console.log('Seeding complete!');
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (already existed): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log('========================================');
}

// ============================================
// SQL EXPORT FUNCTION (for direct database use)
// ============================================

function generateSQL(): string {
  const allWaters = [...washingtonWaters, ...nationalWaters];

  let sql = `-- Water Bodies Seed Data
-- Generated from public sources: USGS, WDFW, State Fish & Game
-- Run with: psql or Supabase SQL Editor

`;

  for (const water of allWaters) {
    const escapedName = water.name.replace(/'/g, "''");
    const escapedCity = water.city.replace(/'/g, "''");
    const escapedDescription = water.description.replace(/'/g, "''");
    const speciesArray = `ARRAY[${water.species.map(s => `'${s}'`).join(', ')}]`;
    const usgsId = water.usgs_site_id ? `'${water.usgs_site_id}'` : 'NULL';

    sql += `INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, usgs_site_id, description)
VALUES ('${escapedName}', '${water.type}', '${water.state}', '${escapedCity}', ${water.latitude}, ${water.longitude}, ${speciesArray}, ${usgsId}, '${escapedDescription}')
ON CONFLICT DO NOTHING;

`;
  }

  return sql;
}

// ============================================
// CLI HANDLING
// ============================================

const args = process.argv.slice(2);

if (args.includes('--sql')) {
  // Output SQL for direct database use
  console.log(generateSQL());
} else if (args.includes('--dry-run')) {
  // Show what would be inserted
  const allWaters = [...washingtonWaters, ...nationalWaters];
  console.log('Dry run - would insert the following waters:\n');

  const byState: Record<string, WaterBody[]> = {};
  for (const water of allWaters) {
    if (!byState[water.state]) byState[water.state] = [];
    byState[water.state].push(water);
  }

  for (const [state, waters] of Object.entries(byState).sort()) {
    console.log(`\n${state} (${waters.length} waters):`);
    for (const water of waters) {
      console.log(`  - ${water.name} (${water.type}) - ${water.city}`);
    }
  }

  console.log(`\nTotal: ${allWaters.length} water bodies`);
} else if (args.includes('--help')) {
  console.log(`
Water Bodies Seed Script

Usage:
  npx tsx scripts/seed-water-bodies.ts [options]

Options:
  --sql       Output SQL statements instead of running against Supabase
  --dry-run   Show what would be inserted without making changes
  --help      Show this help message

Environment Variables (required for default mode):
  SUPABASE_URL              Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY Your service role key (from project settings)

Data Sources:
  - USGS National Water Information System (site IDs for real-time data)
  - Washington Dept of Fish & Wildlife (WDFW) fishing regulations
  - State Fish & Game department stocking reports
  - EPA WATERS GeoViewer geographic coordinates
  - Fly fishing community knowledge and publications

Examples:
  # Run against Supabase
  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/seed-water-bodies.ts

  # Generate SQL file
  npx tsx scripts/seed-water-bodies.ts --sql > seed.sql

  # Preview data
  npx tsx scripts/seed-water-bodies.ts --dry-run
`);
} else {
  // Default: run seeding
  seedWaterBodies().catch(console.error);
}
