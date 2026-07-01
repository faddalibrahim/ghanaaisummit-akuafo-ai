export interface SoilProfile {
  sand: number; // percentage
  silt: number; // percentage
  clay: number; // percentage
  ph: number;
  organicMatter: number; // percentage
  nitrogen: number; // mg/kg
  phosphorus: number; // mg/kg
  potassium: number; // mg/kg
  texture: string; // e.g. "Sandy Loam", "Forest Loam", "Heavy Clay"
}

export interface RiskFactors {
  drought: 'Low' | 'Medium' | 'High';
  disease: 'Low' | 'Medium' | 'High';
  flood: 'Low' | 'Medium' | 'High';
}

export interface Region {
  id: string;
  name: string;
  capital: string;
  description: string;
  soilProfile: SoilProfile;
  rainfallPattern: 'unimodal' | 'bimodal';
  monthlyRainfall: number[]; // 12 elements for Jan-Dec (in mm)
  monthlyTemperature: number[]; // 12 elements for Jan-Dec (in °C)
  riskFactors: RiskFactors;
}

export interface Crop {
  id: string;
  name: string;
  category: string;
  optimalTempMin: number;
  optimalTempMax: number;
  optimalRainMin: number; // during growth cycle
  optimalRainMax: number;
  optimalPhMin: number;
  optimalPhMax: number;
  maturationMonths: number;
  marketDemand: 'Low' | 'Medium' | 'High';
  marketPriceGhS: number;
  priceUnit: string;
  plantingMonths: number[]; // 1-indexed (1 = Jan, 12 = Dec)
  harvestDryMonths: number[]; // 1-indexed
  soilTexturePreferences: string[];
  description: string;
}

export interface CropRecommendation {
  crop: Crop;
  score: number; // 0 to 100
  suitability: 'High' | 'Moderate' | 'Low';
  reasons: string[];
  warnings: string[];
}

export interface PlantingAdvisory {
  soilMoistureStatus: 'Low' | 'Adequate' | 'Saturated';
  soilMoistureScore: number; // 0 to 100
  optimalWindowStart: string;
  optimalWindowEnd: string;
  weeklyRainfallForecast: number[]; // 4 weeks
  advisoryText: string;
  readinessIndex: number; // 0 to 100
}

export interface HarvestAdvisory {
  physiologicalMaturityDate: string;
  harvestWindowStart: string;
  harvestWindowEnd: string;
  rotRisk: 'Low' | 'Medium' | 'High';
  forecastedRainDuringWindow: number; // cumulative mm
  daysOfDrySpell: number;
  advisoryText: string;
}

export interface RiskAlert {
  id: string;
  type: 'drought' | 'disease' | 'weather' | 'pest';
  title: string;
  severity: 'Info' | 'Warning' | 'Critical';
  message: string;
  regionId: string;
  affectedCrops: string[];
  actionSteps: string[];
}

// ----------------------------------------------------
// DATABASE DATA
// ----------------------------------------------------

export const REGIONS: Region[] = [
  {
    id: 'northern',
    name: 'Northern Region',
    capital: 'Tamale',
    description: 'Located in the Savannah zone. Experiences a unimodal rainfall pattern with a long dry Harmattan season and sandy loam soil.',
    soilProfile: {
      sand: 65,
      silt: 20,
      clay: 15,
      ph: 6.2,
      organicMatter: 1.2,
      nitrogen: 45,
      phosphorus: 12,
      potassium: 120,
      texture: 'Sandy Loam'
    },
    rainfallPattern: 'unimodal',
    // Rainfall peaking in Aug/Sept
    monthlyRainfall: [5, 10, 25, 65, 110, 140, 175, 220, 260, 90, 10, 2],
    // High temperatures throughout the year
    monthlyTemperature: [28, 30, 32, 31, 29, 27, 26, 26, 26, 28, 29, 28],
    riskFactors: {
      drought: 'High',
      disease: 'Low',
      flood: 'Medium'
    }
  },
  {
    id: 'ashanti',
    name: 'Ashanti Region',
    capital: 'Kumasi',
    description: 'Located in the deciduous forest zone. Characterized by bimodal rainfall, highly fertile forest ochrosols, and humid climate.',
    soilProfile: {
      sand: 40,
      silt: 35,
      clay: 25,
      ph: 6.5,
      organicMatter: 3.2,
      nitrogen: 110,
      phosphorus: 28,
      potassium: 210,
      texture: 'Forest Loam'
    },
    rainfallPattern: 'bimodal',
    // Bimodal rainfall: April-July & Sept-Nov
    monthlyRainfall: [20, 45, 95, 150, 190, 220, 120, 65, 155, 170, 75, 30],
    monthlyTemperature: [26, 27, 28, 27, 27, 26, 25, 24, 25, 26, 26, 26],
    riskFactors: {
      drought: 'Low',
      disease: 'High',
      flood: 'Medium'
    }
  },
  {
    id: 'greater-accra',
    name: 'Greater Accra',
    capital: 'Accra',
    description: 'Coastal savanna plains. Semi-arid conditions with bimodal but low rainfall and pockets of heavy black clays (Vertisols).',
    soilProfile: {
      sand: 30,
      silt: 20,
      clay: 50,
      ph: 7.2,
      organicMatter: 1.8,
      nitrogen: 65,
      phosphorus: 18,
      potassium: 180,
      texture: 'Heavy Clay'
    },
    rainfallPattern: 'bimodal',
    monthlyRainfall: [15, 25, 45, 80, 140, 190, 60, 20, 40, 70, 35, 10],
    monthlyTemperature: [27, 28, 28, 28, 28, 26, 25, 25, 26, 27, 27, 27],
    riskFactors: {
      drought: 'High',
      disease: 'Medium',
      flood: 'High'
    }
  },
  {
    id: 'volta',
    name: 'Volta Region',
    capital: 'Ho',
    description: 'Transition zone ranging from forest to savanna. Bimodal rainfall with diverse soil compositions (clay-loam transitions).',
    soilProfile: {
      sand: 45,
      silt: 30,
      clay: 25,
      ph: 6.0,
      organicMatter: 2.5,
      nitrogen: 85,
      phosphorus: 20,
      potassium: 160,
      texture: 'Clay Loam'
    },
    rainfallPattern: 'bimodal',
    monthlyRainfall: [15, 35, 80, 120, 150, 180, 110, 70, 140, 150, 60, 20],
    monthlyTemperature: [28, 29, 29, 28, 28, 27, 25, 25, 26, 27, 28, 28],
    riskFactors: {
      drought: 'Medium',
      disease: 'Medium',
      flood: 'Medium'
    }
  }
];

export const CROPS: Crop[] = [
  {
    id: 'maize',
    name: 'White Maize (Obatanpa)',
    category: 'Cereal',
    optimalTempMin: 20,
    optimalTempMax: 30,
    optimalRainMin: 500,
    optimalRainMax: 800,
    optimalPhMin: 5.5,
    optimalPhMax: 7.0,
    maturationMonths: 4,
    marketDemand: 'High',
    marketPriceGhS: 450,
    priceUnit: '100kg Bag',
    plantingMonths: [4, 5, 6, 9], // April, May, June (major season), Sept (minor season)
    harvestDryMonths: [8, 9, 12, 1], // Dry harvest windows
    soilTexturePreferences: ['Sandy Loam', 'Forest Loam', 'Clay Loam'],
    description: 'Maize is Ghana\'s leading staple cereal. The Obatanpa variety is rich in quality protein and adaptable to forest & transition zones.'
  },
  {
    id: 'sorghum',
    name: 'Sorghum (Kapaala)',
    category: 'Cereal',
    optimalTempMin: 24,
    optimalTempMax: 33,
    optimalRainMin: 400,
    optimalRainMax: 650,
    optimalPhMin: 5.5,
    optimalPhMax: 8.0,
    maturationMonths: 4,
    marketDemand: 'Medium',
    marketPriceGhS: 520,
    priceUnit: '100kg Bag',
    plantingMonths: [6, 7], // Planted June/July in the dry North
    harvestDryMonths: [10, 11], // Harvested late Oct/Nov
    soilTexturePreferences: ['Sandy Loam', 'Clay Loam', 'Heavy Clay'],
    description: 'Extremely drought-tolerant cereal crop. Ideal for Northern Region savannahs. Highly demanded by local breweries and for food security.'
  },
  {
    id: 'cassava',
    name: 'Cassava (Bankye)',
    category: 'Tuber',
    optimalTempMin: 22,
    optimalTempMax: 30,
    optimalRainMin: 800,
    optimalRainMax: 1500,
    optimalPhMin: 5.0,
    optimalPhMax: 6.5,
    maturationMonths: 10,
    marketDemand: 'High',
    marketPriceGhS: 320,
    priceUnit: 'Tonne (Raw tubers)',
    plantingMonths: [4, 5, 6, 9, 10], // Early to mid rain
    harvestDryMonths: [2, 3, 4, 11, 12], // Harvested during dry spells to prevent root rot
    soilTexturePreferences: ['Sandy Loam', 'Forest Loam', 'Clay Loam'],
    description: 'A major food security crop in Ghana, processed into Gari, Fufu, and starch. Tolerates poor soils but needs good drainage.'
  },
  {
    id: 'yam',
    name: 'Yam (Pona)',
    category: 'Tuber',
    optimalTempMin: 25,
    optimalTempMax: 30,
    optimalRainMin: 1000,
    optimalRainMax: 1500,
    optimalPhMin: 5.5,
    optimalPhMax: 6.5,
    maturationMonths: 8,
    marketDemand: 'High',
    marketPriceGhS: 950,
    priceUnit: '100 Tubers',
    plantingMonths: [2, 3, 4], // Planted early in mounds
    harvestDryMonths: [10, 11, 12, 1], // Dry season harvest
    soilTexturePreferences: ['Sandy Loam', 'Forest Loam'],
    description: 'Premium cash crop, highly valued for export and domestic consumption. Prefers deep, rich, well-drained soils.'
  },
  {
    id: 'cocoa',
    name: 'Cocoa (Amelonado)',
    category: 'Cash Crop',
    optimalTempMin: 21,
    optimalTempMax: 28,
    optimalRainMin: 1200,
    optimalRainMax: 2000,
    optimalPhMin: 6.0,
    optimalPhMax: 7.0,
    maturationMonths: 12, // Perennial, but evaluated on a 12-month baseline
    marketDemand: 'High',
    marketPriceGhS: 2400,
    priceUnit: '64kg Bag',
    plantingMonths: [5, 6], // Seedling transplantation during major rains
    harvestDryMonths: [10, 11, 12, 1], // Main crop harvest
    soilTexturePreferences: ['Forest Loam'],
    description: 'Ghana\'s primary export commodity. Requires high humidity, consistent moisture, shade, and organic matter rich forest soils.'
  },
  {
    id: 'rice',
    name: 'Local Jasmine Rice (Aduanehene)',
    category: 'Cereal',
    optimalTempMin: 20,
    optimalTempMax: 35,
    optimalRainMin: 900,
    optimalRainMax: 1400,
    optimalPhMin: 5.5,
    optimalPhMax: 6.5,
    maturationMonths: 4,
    marketDemand: 'High',
    marketPriceGhS: 850,
    priceUnit: '50kg Bag',
    plantingMonths: [6, 7], // June, July (during steady rain)
    harvestDryMonths: [10, 11], // October, November
    soilTexturePreferences: ['Clay Loam', 'Heavy Clay'],
    description: 'Jasmine rice variety adapted to lowland valley soils. Requires high water retention and consistent moisture during vegetating phases.'
  },
  {
    id: 'groundnut',
    name: 'Groundnut (Chinese Variety)',
    category: 'Legume',
    optimalTempMin: 22,
    optimalTempMax: 30,
    optimalRainMin: 500,
    optimalRainMax: 900,
    optimalPhMin: 5.5,
    optimalPhMax: 6.5,
    maturationMonths: 4,
    marketDemand: 'High',
    marketPriceGhS: 600,
    priceUnit: '100kg Bag',
    plantingMonths: [4, 5, 8, 9], // April/May or Aug/Sept
    harvestDryMonths: [8, 9, 12, 1],
    soilTexturePreferences: ['Sandy Loam', 'Forest Loam'],
    description: 'Oilseed crop with high protein content. Fixes nitrogen, improving soil health. Best in loose, sandy loam soils to allow easy pegging and harvesting.'
  },
  {
    id: 'cowpea',
    name: 'Cowpea (Songotra)',
    category: 'Legume',
    optimalTempMin: 20,
    optimalTempMax: 32,
    optimalRainMin: 350,
    optimalRainMax: 650,
    optimalPhMin: 5.5,
    optimalPhMax: 7.0,
    maturationMonths: 3,
    marketDemand: 'High',
    marketPriceGhS: 700,
    priceUnit: '100kg Bag',
    plantingMonths: [5, 6, 9],
    harvestDryMonths: [8, 9, 12],
    soilTexturePreferences: ['Sandy Loam', 'Clay Loam'],
    description: 'Fast-growing, drought-tolerant legume. Highly valued for food security and soil nitrogen fixation.'
  },
  {
    id: 'tomato',
    name: 'Tomato (Pectomech)',
    category: 'Vegetable',
    optimalTempMin: 21,
    optimalTempMax: 28,
    optimalRainMin: 400,
    optimalRainMax: 800,
    optimalPhMin: 5.5,
    optimalPhMax: 6.8,
    maturationMonths: 3,
    marketDemand: 'High',
    marketPriceGhS: 1200,
    priceUnit: 'Large Box',
    plantingMonths: [3, 4, 10],
    harvestDryMonths: [6, 7, 1],
    soilTexturePreferences: ['Sandy Loam', 'Forest Loam', 'Clay Loam'],
    description: 'Popular processing tomato variety in Ghana. Requires rich organic soil, consistent warm days, and good drainage to avoid fungal blight.'
  },
  {
    id: 'pepper',
    name: 'Chili Pepper (Legon 18)',
    category: 'Vegetable',
    optimalTempMin: 22,
    optimalTempMax: 32,
    optimalRainMin: 600,
    optimalRainMax: 1200,
    optimalPhMin: 5.5,
    optimalPhMax: 6.8,
    maturationMonths: 4,
    marketDemand: 'High',
    marketPriceGhS: 500,
    priceUnit: 'Net Bag',
    plantingMonths: [4, 5, 10],
    harvestDryMonths: [8, 9, 2],
    soilTexturePreferences: ['Sandy Loam', 'Forest Loam'],
    description: 'Spicy variety widely consumed in Ghana. Performs well in warm, humid regions with well-drained soils rich in compost.'
  },
  {
    id: 'cashew',
    name: 'Raw Cashew Nut',
    category: 'Cash Crop',
    optimalTempMin: 24,
    optimalTempMax: 32,
    optimalRainMin: 800,
    optimalRainMax: 1600,
    optimalPhMin: 5.0,
    optimalPhMax: 6.5,
    maturationMonths: 12,
    marketDemand: 'High',
    marketPriceGhS: 3500,
    priceUnit: 'Tonne',
    plantingMonths: [6, 7],
    harvestDryMonths: [1, 2, 3, 4],
    soilTexturePreferences: ['Sandy Loam', 'Forest Loam'],
    description: 'Drought-resilient cash tree crop, performing exceptionally well in the Brong Ahafo transition zones. Strong export market.'
  }
];

export const RISK_ALERTS: RiskAlert[] = [
  {
    id: 'alert-1',
    type: 'drought',
    title: 'Severe Dry Spell Warning',
    severity: 'Critical',
    message: 'A 21-day dry spell is projected to impact Northern Ghana starting late July. Young crops will suffer acute water stress.',
    regionId: 'northern',
    affectedCrops: ['maize', 'sorghum'],
    actionSteps: [
      'Delay planting if seeds are not yet in the soil.',
      'Mulch existing crops to preserve soil moisture.',
      'Prepare supplementary irrigation if available.'
    ]
  },
  {
    id: 'alert-2',
    type: 'pest',
    title: 'Fall Armyworm Infestation Risk',
    severity: 'Warning',
    message: 'Warm, humid weather in Ashanti is creating ideal breeding conditions for Fall Armyworms. Early stage maize crops are highly susceptible.',
    regionId: 'ashanti',
    affectedCrops: ['maize'],
    actionSteps: [
      'Scout maize fields daily for egg masses or leaf damage.',
      'Apply neem seed extracts or biological controls early.',
      'Report outbreaks immediately to the local MoFA extension agent.'
    ]
  },
  {
    id: 'alert-3',
    type: 'weather',
    title: 'Torrential Washout Hazard',
    severity: 'Warning',
    message: 'Heavy bimodal peaks in Greater Accra are expected to bring over 150mm of rain within 48 hours, causing localized flooding and waterlogging.',
    regionId: 'greater-accra',
    affectedCrops: ['cassava', 'maize'],
    actionSteps: [
      'Clear drainage channels around the field perimeter.',
      'Avoid harvesting cassava during waterlogged states to prevent post-harvest root rot.',
      'Do not apply fertilizers right before the heavy rains to avoid runoff.'
    ]
  },
  {
    id: 'alert-4',
    type: 'disease',
    title: 'Black Pod Disease Alert',
    severity: 'Warning',
    message: 'Excessive humidity and prolonged wet canopy hours in Volta and Ashanti are driving cocoa black pod fungus development.',
    regionId: 'volta',
    affectedCrops: ['cocoa'],
    actionSteps: [
      'Prune shade trees and excess foliage to improve sunlight and aeration.',
      'Remove and destroy infected pods from trees immediately.',
      'Apply approved copper-based fungicides if threshold is exceeded.'
    ]
  }
];

// ----------------------------------------------------
// INTELLIGENCE ALGORITHMS (RULES ENGINE / MODEL SIM)
// ----------------------------------------------------

export function recommendCrops(regionId: string, plantingMonth: number): CropRecommendation[] {
  const region = REGIONS.find((r) => r.id === regionId);
  if (!region) return [];

  return CROPS.map((crop) => {
    let score = 80; // Baseline score
    const reasons: string[] = [];
    const warnings: string[] = [];

    // 1. Month Suitability Check
    if (crop.plantingMonths.includes(plantingMonth)) {
      score += 10;
      reasons.push(`Optimal planting window: Month ${plantingMonth} falls within recommended sowing months.`);
    } else {
      score -= 25;
      warnings.push(`Sub-optimal window: Month ${plantingMonth} is outside typical planting cycles for this crop.`);
    }

    // 2. Soil Texture Matching
    if (crop.soilTexturePreferences.includes(region.soilProfile.texture)) {
      score += 10;
      reasons.push(`Soil texture match: ${region.soilProfile.texture} is highly compatible with root development.`);
    } else {
      score -= 15;
      warnings.push(`Soil mismatch: Prefers ${crop.soilTexturePreferences.join('/')}, but region has ${region.soilProfile.texture}.`);
    }

    // 3. Soil pH Matching
    const ph = region.soilProfile.ph;
    if (ph >= crop.optimalPhMin && ph <= crop.optimalPhMax) {
      score += 5;
      reasons.push(`Ideal soil pH (${ph}): Nutrient uptake is maximized in this range.`);
    } else if (ph < crop.optimalPhMin) {
      score -= 10;
      warnings.push(`Slightly acidic soil (${ph}) may limit phosphate availability.`);
    } else {
      score -= 10;
      warnings.push(`Alkaline soil (${ph}) may lock micro-nutrients.`);
    }

    // 4. Climatic Match (Temperature & Rainfall)
    // Evaluate growth temperature over maturation period
    const cycleMonths = Array.from(
      { length: crop.maturationMonths },
      (_, i) => ((plantingMonth - 1 + i) % 12) + 1
    );

    let averageTemp = 0;
    let cumulativeRainfall = 0;
    cycleMonths.forEach((m) => {
      averageTemp += region.monthlyTemperature[m - 1];
      cumulativeRainfall += region.monthlyRainfall[m - 1];
    });
    averageTemp /= crop.maturationMonths;

    // Check temp boundaries
    if (averageTemp >= crop.optimalTempMin && averageTemp <= crop.optimalTempMax) {
      score += 5;
      reasons.push(`Favorable temperature: Growth cycle average of ${averageTemp.toFixed(1)}°C matches metabolic demands.`);
    } else {
      score -= 15;
      warnings.push(`Thermal stress: Average cycle temp ${averageTemp.toFixed(1)}°C is outside optimal (${crop.optimalTempMin}-${crop.optimalTempMax}°C).`);
    }

    // Check rainfall boundaries
    if (cumulativeRainfall >= crop.optimalRainMin && cumulativeRainfall <= crop.optimalRainMax) {
      score += 10;
      reasons.push(`Ideal rainfall volume: Cumulative projection is ${cumulativeRainfall.toFixed(0)}mm (optimal: ${crop.optimalRainMin}-${crop.optimalRainMax}mm).`);
    } else if (cumulativeRainfall < crop.optimalRainMin) {
      const deficit = crop.optimalRainMin - cumulativeRainfall;
      score -= Math.min(30, deficit / 10);
      warnings.push(`Water deficit: Expected rainfall ${cumulativeRainfall.toFixed(0)}mm falls short of crop needs by ${deficit.toFixed(0)}mm. Irrigation required.`);
    } else {
      const surplus = cumulativeRainfall - crop.optimalRainMax;
      score -= Math.min(20, surplus / 20);
      warnings.push(`Water excess: Expected rainfall ${cumulativeRainfall.toFixed(0)}mm exceeds limits by ${surplus.toFixed(0)}mm. Risk of root waterlogging.`);
    }

    // 5. Market demand adjustment
    if (crop.marketDemand === 'High') {
      score += 5;
      reasons.push(`Strong market demand: Pona yam / Obatanpa maize sells quickly in local hubs (Kumasi/Accra).`);
    } else if (crop.marketDemand === 'Low') {
      score -= 5;
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Suitability Category
    let suitability: 'High' | 'Moderate' | 'Low' = 'Low';
    if (score >= 80) suitability = 'High';
    else if (score >= 50) suitability = 'Moderate';

    return {
      crop,
      score: Math.round(score),
      suitability,
      reasons,
      warnings
    };
  }).sort((a, b) => b.score - a.score);
}

export function getPlantingAdvisory(regionId: string, cropId: string, simulatedDate = new Date()): PlantingAdvisory {
  const region = REGIONS.find((r) => r.id === regionId);
  const crop = CROPS.find((c) => c.id === cropId);

  if (!region || !crop) {
    return {
      soilMoistureStatus: 'Low',
      soilMoistureScore: 10,
      optimalWindowStart: 'N/A',
      optimalWindowEnd: 'N/A',
      weeklyRainfallForecast: [0, 0, 0, 0],
      advisoryText: 'Invalid region or crop selected.',
      readinessIndex: 0
    };
  }

  // Get current calendar month
  const month = simulatedDate.getMonth() + 1; // 1-12
  const currentRain = region.monthlyRainfall[month - 1];

  // Soil moisture calculation based on recent rainfall
  let moistureScore = 0;
  if (currentRain > 150) {
    moistureScore = 85;
  } else if (currentRain > 80) {
    moistureScore = 65;
  } else if (currentRain > 30) {
    moistureScore = 40;
  } else {
    moistureScore = 15;
  }

  // Heavy clay soil retains water, sandy loam drains quickly
  if (region.soilProfile.texture === 'Heavy Clay') {
    moistureScore = Math.min(100, moistureScore * 1.2);
  } else if (region.soilProfile.texture === 'Sandy Loam') {
    moistureScore = moistureScore * 0.9;
  }

  moistureScore = Math.round(moistureScore);

  let soilMoistureStatus: 'Low' | 'Adequate' | 'Saturated' = 'Low';
  if (moistureScore > 75) soilMoistureStatus = 'Saturated';
  else if (moistureScore >= 35) soilMoistureStatus = 'Adequate';

  // Calculate simulated weekly rain forecast
  // Distribute monthly rainfall with some random/semi-random variation
  const weeklyBase = currentRain / 4;
  const weeklyRainfallForecast = [
    Math.round(weeklyBase * 0.9),
    Math.round(weeklyBase * 1.2),
    Math.round(weeklyBase * 0.8),
    Math.round(weeklyBase * 1.1)
  ];

  // Check if current month is optimal planting month
  const isOptimalMonth = crop.plantingMonths.includes(month);
  let readinessIndex = 0;
  let advisoryText = '';
  let startDay = 1;
  let endDay = 30;

  if (isOptimalMonth) {
    if (soilMoistureStatus === 'Adequate') {
      readinessIndex = 90;
      advisoryText = `EXCELLENT window. Soil moisture is adequate (${moistureScore}%) and rain forecasts suggest steady seed germination support. Sow now.`;
      startDay = 5;
      endDay = 20;
    } else if (soilMoistureStatus === 'Saturated') {
      readinessIndex = 65;
      advisoryText = `CAUTION. Soil is saturated (${moistureScore}%) due to recent heavy rains. Risk of seed rot. Wait 5 days for water drainage.`;
      startDay = 15;
      endDay = 30;
    } else {
      readinessIndex = 40;
      advisoryText = `RISKY. Planting month is correct, but soil moisture is low (${moistureScore}%). Germination failure likely without supplementary irrigation. Delay planting until heavy rains resume.`;
      startDay = 20;
      endDay = 10; // Wraps to next month
    }
  } else {
    readinessIndex = 20;
    advisoryText = `UNRECOMMENDED. Current month is outside this crop's growing season window. Growing now puts the cycle under severe temperature/water constraints.`;
  }

  // Format date range strings
  const monthsStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const optimalWindowStart = `${startDay} ${monthsStr[month - 1]}`;
  const nextMonthIdx = startDay > endDay ? (month % 12) : (month - 1);
  const optimalWindowEnd = `${endDay} ${monthsStr[nextMonthIdx]}`;

  return {
    soilMoistureStatus,
    soilMoistureScore: moistureScore,
    optimalWindowStart,
    optimalWindowEnd,
    weeklyRainfallForecast,
    advisoryText,
    readinessIndex
  };
}

export function getHarvestAdvisory(regionId: string, cropId: string, plantingDateStr: string): HarvestAdvisory {
  const region = REGIONS.find((r) => r.id === regionId);
  const crop = CROPS.find((c) => c.id === cropId);

  if (!region || !crop) {
    return {
      physiologicalMaturityDate: 'N/A',
      harvestWindowStart: 'N/A',
      harvestWindowEnd: 'N/A',
      rotRisk: 'Medium',
      forecastedRainDuringWindow: 0,
      daysOfDrySpell: 0,
      advisoryText: 'Invalid region or crop selection.'
    };
  }

  // Parse planting date
  const plantingDate = new Date(plantingDateStr);
  const maturityDate = new Date(plantingDate);
  maturityDate.setMonth(plantingDate.getMonth() + crop.maturationMonths);

  const maturityMonth = maturityDate.getMonth() + 1; // 1-12

  // Ideal harvest window starts at physiological maturity
  const harvestStart = new Date(maturityDate);
  const harvestEnd = new Date(maturityDate);
  harvestEnd.setDate(harvestEnd.getDate() + 14); // 2 weeks window

  const monthlyRain = region.monthlyRainfall[maturityMonth - 1];

  // Dry spells analysis:
  // If rainfall in the maturity month is low (<50mm), high days of dry spell.
  // If high (>150mm), low dry spell, high rot risk.
  let daysOfDrySpell = 0;
  let forecastedRainDuringWindow = 0;
  let rotRisk: 'Low' | 'Medium' | 'High' = 'Low';
  let advisoryText = '';

  if (monthlyRain < 40) {
    daysOfDrySpell = 12;
    forecastedRainDuringWindow = 10;
    rotRisk = 'Low';
    advisoryText = `PERFECT harvest window. Low moisture levels (${forecastedRainDuringWindow}mm) and ${daysOfDrySpell} days of sunshine ensure complete dry down, mitigating aflatoxin risk.`;
  } else if (monthlyRain < 100) {
    daysOfDrySpell = 8;
    forecastedRainDuringWindow = 35;
    rotRisk = 'Medium';
    advisoryText = `MODERATE risk. Expect occasional showers (${forecastedRainDuringWindow}mm). Plan harvesting around dry days (approx ${daysOfDrySpell} sunny days). Dry crops under cover.`;
  } else {
    daysOfDrySpell = 3;
    forecastedRainDuringWindow = 90;
    rotRisk = 'High';
    advisoryText = `HIGH RISK. Heavy rainfall expected during harvest window (${forecastedRainDuringWindow}mm). Crops subject to field spoilage, mold, and rot. Delay harvesting or invest in mechanical air-drying.`;
  }

  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  
  return {
    physiologicalMaturityDate: maturityDate.toLocaleDateString('en-GB', dateOptions),
    harvestWindowStart: harvestStart.toLocaleDateString('en-GB', dateOptions),
    harvestWindowEnd: harvestEnd.toLocaleDateString('en-GB', dateOptions),
    rotRisk,
    forecastedRainDuringWindow,
    daysOfDrySpell,
    advisoryText
  };
}

// ----------------------------------------------------
// USSD STATE MACHINE INTERNALS
// ----------------------------------------------------

export interface USSDSession {
  sessionId: string;
  phoneNumber: string;
  state: 'welcome' | 'menu' | 'crop_recommender_month' | 'crop_recommender_results' | 'planting_crop' | 'planting_results' | 'harvest_crop' | 'harvest_planted_date' | 'harvest_results' | 'risk_results';
  regionId?: string;
  cropId?: string;
  selectedMonth?: number;
}

const sessionsMemory: Record<string, USSDSession> = {};

export function processUSSDRequest(sessionId: string, phoneNumber: string, text: string): string {
  // If text is empty or *902#, treat as new/reset session
  let session = sessionsMemory[sessionId];
  if (!session || text === '' || text.endsWith('*902#')) {
    session = {
      sessionId,
      phoneNumber,
      state: 'welcome'
    };
    sessionsMemory[sessionId] = session;
    return `CON Welcome to Akuafo AI Advisor.\nSelect your region:\n1. Northern\n2. Ashanti\n3. Greater Accra\n4. Volta`;
  }

  // Get active inputs sequence
  const parts = text.split('*');
  const lastInput = parts[parts.length - 1];

  switch (session.state) {
    case 'welcome': {
      const idx = parseInt(lastInput, 10);
      if (idx >= 1 && idx <= 4) {
        const regionMap = ['northern', 'ashanti', 'greater-accra', 'volta'];
        session.regionId = regionMap[idx - 1];
        session.state = 'welcome' as any; // Temporary transition step
        
        // Present menu for that region
        const reg = REGIONS.find(r => r.id === session.regionId);
        session.state = 'welcome' as any; // Next state transition
        
        // Wait, we need a standard USSD sub-menu structure:
        // After choosing Region, ask what they want to check
        // Save region selection, set state to 'menu'
        (session as any).state = 'menu';
        return `CON Akuafo AI - ${reg?.name}\nSelect service:\n1. Crop Recommendations\n2. Planting Windows\n3. Harvest Advisor\n4. Regional Risk Alerts`;
      }
      return `END Invalid input. Dial *902# to restart.`;
    }

    case 'menu': {
      const choice = parseInt(lastInput, 10);
      const reg = REGIONS.find(r => r.id === session.regionId);
      if (!reg) return `END Session error. Dial *902# to restart.`;

      if (choice === 1) {
        session.state = 'crop_recommender_month';
        return `CON Select target planting month:\n1. Jan  2. Feb  3. Mar\n4. Apr  5. May  6. Jun\n7. Jul  8. Aug  9. Sep\n10. Oct 11. Nov 12. Dec`;
      } else if (choice === 2) {
        session.state = 'planting_crop';
        return `CON Select Crop:\n1. Maize\n2. Sorghum\n3. Cassava\n4. Yam\n5. Cocoa`;
      } else if (choice === 3) {
        session.state = 'harvest_crop';
        return `CON Select Crop:\n1. Maize\n2. Sorghum\n3. Cassava\n4. Yam\n5. Cocoa`;
      } else if (choice === 4) {
        // Fetch risks
        const alerts = RISK_ALERTS.filter(a => a.regionId === session.regionId);
        if (alerts.length === 0) {
          return `END Akuafo AI Info:\nNo critical risks active for ${reg.name} at this time. Keep farming!`;
        }
        const riskMsg = alerts.map(a => `[${a.severity}] ${a.title}: ${a.message.substring(0, 50)}...`).join('\n');
        return `END Akuafo AI Risk Report:\n${riskMsg}`;
      }
      return `CON Invalid choice. Select option:\n1. Crop Recommendations\n2. Planting Windows\n3. Harvest Advisor\n4. Regional Risk Alerts`;
    }

    case 'crop_recommender_month': {
      const monthIdx = parseInt(lastInput, 10);
      if (monthIdx >= 1 && monthIdx <= 12) {
        session.selectedMonth = monthIdx;
        const recommendations = recommendCrops(session.regionId!, monthIdx);
        if (recommendations.length === 0) {
          return `END No crop data available for this zone.`;
        }
        
        // Show top 3 crop recommendations
        const topCrops = recommendations.slice(0, 3).map((rec, i) => 
          `${i+1}. ${rec.crop.name} (${rec.score}%)`
        ).join('\n');

        return `END Top recommendations for Month ${monthIdx}:\n${topCrops}\nAPI info: crop prices are stable.`;
      }
      return `CON Invalid month. Enter 1-12:`;
    }

    case 'planting_crop': {
      const cropIdx = parseInt(lastInput, 10);
      const cropMap = ['maize', 'sorghum', 'cassava', 'yam', 'cocoa'];
      if (cropIdx >= 1 && cropIdx <= 5) {
        session.cropId = cropMap[cropIdx - 1];
        const adv = getPlantingAdvisory(session.regionId!, session.cropId!);
        
        // Return summary
        return `END Planting Advisory:\nReadiness Index: ${adv.readinessIndex}/100\nMoisture: ${adv.soilMoistureStatus} (${adv.soilMoistureScore}%)\nWindow: ${adv.optimalWindowStart} - ${adv.optimalWindowEnd}\n${adv.advisoryText.substring(0, 60)}...`;
      }
      return `CON Invalid selection. Select Crop:\n1. Maize\n2. Sorghum\n3. Cassava\n4. Yam\n5. Cocoa`;
    }

    case 'harvest_crop': {
      const cropIdx = parseInt(lastInput, 10);
      const cropMap = ['maize', 'sorghum', 'cassava', 'yam', 'cocoa'];
      if (cropIdx >= 1 && cropIdx <= 5) {
        session.cropId = cropMap[cropIdx - 1];
        session.state = 'harvest_planted_date';
        return `CON When did you plant? Enter month number:\n(e.g., enter 4 for April, 6 for June):`;
      }
      return `CON Invalid selection. Select Crop:\n1. Maize\n2. Sorghum\n3. Cassava\n4. Yam\n5. Cocoa`;
    }

    case 'harvest_planted_date': {
      const monthInput = parseInt(lastInput, 10);
      if (monthInput >= 1 && monthInput <= 12) {
        // Construct a planting date representation (current year, selected month, 1st day)
        const year = new Date().getFullYear();
        const plantingDateStr = `${year}-${String(monthInput).padStart(2, '0')}-01`;
        
        const adv = getHarvestAdvisory(session.regionId!, session.cropId!, plantingDateStr);
        return `END Harvest Advisory:\nMaturity: ${adv.physiologicalMaturityDate}\nRot Risk: ${adv.rotRisk}\nRain Forecast: ${adv.forecastedRainDuringWindow}mm\n${adv.advisoryText.substring(0, 65)}...`;
      }
      return `CON Invalid month. Enter planting month (1-12):`;
    }

    default:
      return `END Invalid USSD state. Dial *902# to restart.`;
  }
}
