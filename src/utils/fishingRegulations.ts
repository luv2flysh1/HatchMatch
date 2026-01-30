/**
 * Fishing Regulations URL Mapping
 *
 * Maps US state abbreviations to their official state fishing regulations pages.
 * These URLs point to official state fish and wildlife agency websites.
 */

export interface StateRegulationInfo {
  url: string;
  agencyName: string;
}

/**
 * Mapping of US state abbreviations to official fishing regulations URLs.
 * Each entry includes the regulations URL and the agency name.
 */
export const STATE_REGULATIONS: Record<string, StateRegulationInfo> = {
  // Alabama
  AL: {
    url: 'https://www.outdooralabama.com/fishing/freshwater-fishing-regulations',
    agencyName: 'Alabama Department of Conservation and Natural Resources',
  },
  // Alaska
  AK: {
    url: 'https://www.adfg.alaska.gov/index.cfm?adfg=fishregulations.main',
    agencyName: 'Alaska Department of Fish and Game',
  },
  // Arizona
  AZ: {
    url: 'https://www.azgfd.com/fishing/regulations/',
    agencyName: 'Arizona Game and Fish Department',
  },
  // Arkansas
  AR: {
    url: 'https://www.agfc.com/en/fishing/regulations/',
    agencyName: 'Arkansas Game and Fish Commission',
  },
  // California
  CA: {
    url: 'https://wildlife.ca.gov/Fishing/Regulations',
    agencyName: 'California Department of Fish and Wildlife',
  },
  // Colorado
  CO: {
    url: 'https://cpw.state.co.us/thingstodo/Pages/FishingRegulations.aspx',
    agencyName: 'Colorado Parks and Wildlife',
  },
  // Connecticut
  CT: {
    url: 'https://portal.ct.gov/DEEP/Fishing/Fishing-Regulations',
    agencyName: 'Connecticut Department of Energy and Environmental Protection',
  },
  // Delaware
  DE: {
    url: 'https://dnrec.delaware.gov/fish-wildlife/fishing/regulations/',
    agencyName: 'Delaware Division of Fish and Wildlife',
  },
  // Florida
  FL: {
    url: 'https://myfwc.com/fishing/freshwater/regulations/',
    agencyName: 'Florida Fish and Wildlife Conservation Commission',
  },
  // Georgia
  GA: {
    url: 'https://georgiawildlife.com/fishing/regulations',
    agencyName: 'Georgia Department of Natural Resources',
  },
  // Hawaii
  HI: {
    url: 'https://dlnr.hawaii.gov/dar/fishing/fishing-regulations/',
    agencyName: 'Hawaii Division of Aquatic Resources',
  },
  // Idaho
  ID: {
    url: 'https://idfg.idaho.gov/fish/rules',
    agencyName: 'Idaho Department of Fish and Game',
  },
  // Illinois
  IL: {
    url: 'https://dnr.illinois.gov/fishing/fishingregulations.html',
    agencyName: 'Illinois Department of Natural Resources',
  },
  // Indiana
  IN: {
    url: 'https://www.in.gov/dnr/fish-and-wildlife/fishing/fishing-regulations/',
    agencyName: 'Indiana Department of Natural Resources',
  },
  // Iowa
  IA: {
    url: 'https://www.iowadnr.gov/Fishing/Fishing-Regulations',
    agencyName: 'Iowa Department of Natural Resources',
  },
  // Kansas
  KS: {
    url: 'https://ksoutdoors.com/Fishing/Fishing-Regulations',
    agencyName: 'Kansas Department of Wildlife and Parks',
  },
  // Kentucky
  KY: {
    url: 'https://fw.ky.gov/Fish/Pages/Fishing-Regulations.aspx',
    agencyName: 'Kentucky Department of Fish and Wildlife Resources',
  },
  // Louisiana
  LA: {
    url: 'https://www.wlf.louisiana.gov/fishing/regulations',
    agencyName: 'Louisiana Department of Wildlife and Fisheries',
  },
  // Maine
  ME: {
    url: 'https://www.maine.gov/ifw/fishing-boating/fishing/regulations-laws/',
    agencyName: 'Maine Department of Inland Fisheries and Wildlife',
  },
  // Maryland
  MD: {
    url: 'https://dnr.maryland.gov/fisheries/Pages/regulations/index.aspx',
    agencyName: 'Maryland Department of Natural Resources',
  },
  // Massachusetts
  MA: {
    url: 'https://www.mass.gov/freshwater-fishing-regulations',
    agencyName: 'Massachusetts Division of Fisheries and Wildlife',
  },
  // Michigan
  MI: {
    url: 'https://www.michigan.gov/dnr/things-to-do/fishing/regulations',
    agencyName: 'Michigan Department of Natural Resources',
  },
  // Minnesota
  MN: {
    url: 'https://www.dnr.state.mn.us/fishing/regulations.html',
    agencyName: 'Minnesota Department of Natural Resources',
  },
  // Mississippi
  MS: {
    url: 'https://www.mdwfp.com/fishing-boating/freshwater-fishing-regulations/',
    agencyName: 'Mississippi Department of Wildlife, Fisheries, and Parks',
  },
  // Missouri
  MO: {
    url: 'https://mdc.mo.gov/fishing/regulations',
    agencyName: 'Missouri Department of Conservation',
  },
  // Montana
  MT: {
    url: 'https://fwp.mt.gov/fish/regulations',
    agencyName: 'Montana Fish, Wildlife and Parks',
  },
  // Nebraska
  NE: {
    url: 'https://outdoornebraska.gov/fishing/fishing-regulations/',
    agencyName: 'Nebraska Game and Parks Commission',
  },
  // Nevada
  NV: {
    url: 'https://www.ndow.org/fishing/regulations/',
    agencyName: 'Nevada Department of Wildlife',
  },
  // New Hampshire
  NH: {
    url: 'https://www.wildlife.nh.gov/fishing/freshwater-fishing/regulations',
    agencyName: 'New Hampshire Fish and Game Department',
  },
  // New Jersey
  NJ: {
    url: 'https://www.nj.gov/dep/fgw/fishingregs.htm',
    agencyName: 'New Jersey Division of Fish and Wildlife',
  },
  // New Mexico
  NM: {
    url: 'https://www.wildlife.state.nm.us/fishing/regulations/',
    agencyName: 'New Mexico Department of Game and Fish',
  },
  // New York
  NY: {
    url: 'https://www.dec.ny.gov/outdoor/7917.html',
    agencyName: 'New York Department of Environmental Conservation',
  },
  // North Carolina
  NC: {
    url: 'https://www.ncwildlife.org/Fishing/Regulations',
    agencyName: 'North Carolina Wildlife Resources Commission',
  },
  // North Dakota
  ND: {
    url: 'https://gf.nd.gov/fishing/regulations',
    agencyName: 'North Dakota Game and Fish Department',
  },
  // Ohio
  OH: {
    url: 'https://ohiodnr.gov/fishing/fishing-regulations',
    agencyName: 'Ohio Department of Natural Resources',
  },
  // Oklahoma
  OK: {
    url: 'https://www.wildlifedepartment.com/fishing/regulations',
    agencyName: 'Oklahoma Department of Wildlife Conservation',
  },
  // Oregon
  OR: {
    url: 'https://myodfw.com/fishing/fishing-regulations',
    agencyName: 'Oregon Department of Fish and Wildlife',
  },
  // Pennsylvania
  PA: {
    url: 'https://www.fishandboat.com/Fishing/Regulations',
    agencyName: 'Pennsylvania Fish and Boat Commission',
  },
  // Rhode Island
  RI: {
    url: 'https://dem.ri.gov/natural-resources-bureau/fish-wildlife/freshwater-fisheries/freshwater-fishing-regulations',
    agencyName: 'Rhode Island Department of Environmental Management',
  },
  // South Carolina
  SC: {
    url: 'https://www.dnr.sc.gov/fishing/regulations.html',
    agencyName: 'South Carolina Department of Natural Resources',
  },
  // South Dakota
  SD: {
    url: 'https://gfp.sd.gov/fishing/regulations/',
    agencyName: 'South Dakota Game, Fish and Parks',
  },
  // Tennessee
  TN: {
    url: 'https://www.tn.gov/twra/fishing/fishing-regulations.html',
    agencyName: 'Tennessee Wildlife Resources Agency',
  },
  // Texas
  TX: {
    url: 'https://tpwd.texas.gov/regulations/outdoor-annual/fishing/',
    agencyName: 'Texas Parks and Wildlife Department',
  },
  // Utah
  UT: {
    url: 'https://wildlife.utah.gov/fishing/regulations.html',
    agencyName: 'Utah Division of Wildlife Resources',
  },
  // Vermont
  VT: {
    url: 'https://vtfishandwildlife.com/fish/fishing-regulations',
    agencyName: 'Vermont Fish and Wildlife Department',
  },
  // Virginia
  VA: {
    url: 'https://dwr.virginia.gov/fishing/regulations/',
    agencyName: 'Virginia Department of Wildlife Resources',
  },
  // Washington
  WA: {
    url: 'https://wdfw.wa.gov/fishing/regulations',
    agencyName: 'Washington Department of Fish and Wildlife',
  },
  // West Virginia
  WV: {
    url: 'https://wvdnr.gov/fishing/regulations/',
    agencyName: 'West Virginia Division of Natural Resources',
  },
  // Wisconsin
  WI: {
    url: 'https://dnr.wisconsin.gov/topic/fishing/regulations',
    agencyName: 'Wisconsin Department of Natural Resources',
  },
  // Wyoming
  WY: {
    url: 'https://wgfd.wyo.gov/Fishing-and-Boating/Fishing-Regulations',
    agencyName: 'Wyoming Game and Fish Department',
  },
};

/**
 * State name mapping for display purposes
 */
export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

/**
 * Get the fishing regulations URL for a given state code.
 *
 * @param stateCode - Two-letter US state abbreviation (e.g., "WA", "MT")
 * @returns The regulations URL if found, or null if not available
 */
export function getRegulationsUrl(stateCode: string): string | null {
  const upperCode = stateCode?.toUpperCase().trim();
  const info = STATE_REGULATIONS[upperCode];
  return info?.url ?? null;
}

/**
 * Get the full regulations info for a given state code.
 *
 * @param stateCode - Two-letter US state abbreviation (e.g., "WA", "MT")
 * @returns The StateRegulationInfo object if found, or null if not available
 */
export function getRegulationsInfo(stateCode: string): StateRegulationInfo | null {
  const upperCode = stateCode?.toUpperCase().trim();
  return STATE_REGULATIONS[upperCode] ?? null;
}

/**
 * Get the full state name for a given state code.
 *
 * @param stateCode - Two-letter US state abbreviation (e.g., "WA", "MT")
 * @returns The full state name if found, or the original code if not found
 */
export function getStateName(stateCode: string): string {
  const upperCode = stateCode?.toUpperCase().trim();
  return STATE_NAMES[upperCode] ?? stateCode;
}

/**
 * Check if a state has regulations info available.
 *
 * @param stateCode - Two-letter US state abbreviation
 * @returns true if regulations are available for the state
 */
export function hasRegulationsInfo(stateCode: string): boolean {
  const upperCode = stateCode?.toUpperCase().trim();
  return upperCode in STATE_REGULATIONS;
}
