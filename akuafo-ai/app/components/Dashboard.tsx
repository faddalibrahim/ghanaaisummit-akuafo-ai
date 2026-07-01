'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import GhanaMap from '@/components/GhanaMap';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  REGIONS,
  CROPS,
  RISK_ALERTS,
  recommendCrops,
  getPlantingAdvisory,
  getHarvestAdvisory,
  processUSSDRequest,
  Region,
  CropRecommendation,
  PlantingAdvisory,
  HarvestAdvisory,
  RiskAlert
} from '../lib/data';

// Import shadcn UI components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

const REGION_TO_ZONE: { [key: string]: string } = {
  // Northern Sector
  'GHNP': 'northern', 'GHNE': 'northern', 'GHSV': 'northern', 'GHUW': 'northern', 'GHUE': 'northern',
  // Forest Sector (Ashanti/Bono)
  'GHAH': 'ashanti', 'GHAF': 'ashanti', 'GHBO': 'ashanti', 'GHBE': 'ashanti',
  // Eastern/Volta Sector
  'GHTV': 'volta', 'GHOT': 'volta', 'GHEP': 'volta',
  // Coastal Sector
  'GHAA': 'greater-accra', 'GHCP': 'greater-accra', 'GHWP': 'greater-accra', 'GHWN': 'greater-accra',
};

const REGION_METADATA: { [key: string]: { name: string; capital: string; description: string } } = {
  'GHNP': {
    name: 'Northern Region',
    capital: 'Tamale',
    description: 'Located in the Savannah zone. Experiences a unimodal rainfall pattern with a long dry Harmattan season and sandy loam soil.'
  },
  'GHNE': {
    name: 'North East Region',
    capital: 'Nalerigu',
    description: 'Located in the northern savanna plains. Unimodal rainfall peaking in late summer, with agricultural focus on grains and livestock.'
  },
  'GHSV': {
    name: 'Savannah Region',
    capital: 'Damongo',
    description: 'The largest region in land area, situated in the Savannah zone. Features fertile soils for yams, sorghum, and millet, and unimodal climate.'
  },
  'GHUW': {
    name: 'Upper West Region',
    capital: 'Wa',
    description: 'Part of the semi-arid savanna zone. Highly unimodal rainfall pattern, focused on drought-resistant crops like cowpea and sorghum.'
  },
  'GHUE': {
    name: 'Upper East Region',
    capital: 'Bolgatanga',
    description: 'Dry savanna plains bordering the Sahel. Experiences high heat, unimodal rainfall, and focus on dry-season irrigation crops like onions.'
  },
  'GHAH': {
    name: 'Ashanti Region',
    capital: 'Kumasi',
    description: 'Located in the deciduous forest zone. Characterized by bimodal rainfall, highly fertile forest ochrosols, and humid climate.'
  },
  'GHAF': {
    name: 'Ahafo Region',
    capital: 'Goaso',
    description: 'High forest zone. Possesses highly fertile ochrosol soils, heavy cocoa production, and bimodal rainfall.'
  },
  'GHBO': {
    name: 'Bono Region',
    capital: 'Sunyani',
    description: 'Forest-savanna transition zone. Known as the breadbasket of Ghana, producing major yields of maize, yams, and cocoa under bimodal rain.'
  },
  'GHBE': {
    name: 'Bono East Region',
    capital: 'Techiman',
    description: 'Transition zone. High trade hub centered around the Techiman market, producing vast quantities of tubers and grains under bimodal rain.'
  },
  'GHTV': {
    name: 'Volta Region',
    capital: 'Ho',
    description: 'Transition zone ranging from forest to savanna. Bimodal rainfall with diverse soil compositions (clay-loam transitions).'
  },
  'GHOT': {
    name: 'Oti Region',
    capital: 'Dambai',
    description: 'Northern transition belt. Combines savanna plains with fertile river valleys, focused on yams, cassava, and grains under bimodal rain.'
  },
  'GHEP': {
    name: 'Eastern Region',
    capital: 'Koforidua',
    description: 'Deciduous forest zone with rich ochrosols. Famous for cocoa, plantains, oil palm, and robust bimodal rainfall.'
  },
  'GHAA': {
    name: 'Greater Accra',
    capital: 'Accra',
    description: 'Coastal savanna plains. Semi-arid conditions with bimodal but low rainfall and pockets of heavy black clays (Vertisols).'
  },
  'GHCP': {
    name: 'Central Region',
    capital: 'Cape Coast',
    description: 'Coastal savanna transition. Bimodal rainfall, supporting extensive citrus farming, coconut groves, and coastal fishing communities.'
  },
  'GHWP': {
    name: 'Western Region',
    capital: 'Sekondi-Takoradi',
    description: 'Wet evergreen forest zone. Receives the highest rainfall in Ghana, supporting heavy cocoa, rubber, coconut, and oil palm cultivation.'
  },
  'GHWN': {
    name: 'Western North Region',
    capital: 'Sefwi Wiawso',
    description: 'High forest zone with abundant rainfall. Key cocoa producing hub with highly fertile forest soil and rich timber resources.'
  }
};

const CATEGORIES = [
  { label: 'Cereals', value: 'Cereal' },
  { label: 'Legumes', value: 'Legume' },
  { label: 'Tubers', value: 'Tuber' },
  { label: 'Vegetables', value: 'Vegetable' },
  { label: 'Cash Crops', value: 'Cash Crop' }
];

export default function Dashboard() {
  // Region Selection (tracks the selected 16-region ID)
  const [selectedRegionId, setSelectedRegionId] = useState<string>('GHNP');
  const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);

  // Months for selectors (1-indexed)
  const [currentMonth, setCurrentMonth] = useState<number>(6); // Default: June

  // Crop Suitability
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<CropRecommendation | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Cereal');
  const [isSoilExpanded, setIsSoilExpanded] = useState<boolean>(true);

  // Filter recommendations based on search query and category
  const filteredRecommendations = React.useMemo(() => {
    return recommendations.filter((rec) => {
      const matchesCategory = rec.crop.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = rec.crop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            rec.crop.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            rec.crop.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [recommendations, searchQuery, selectedCategory]);

  // Clear selected crop when filters filter out the current one
  useEffect(() => {
    if (selectedRec) {
      const isStillVisible = filteredRecommendations.some(r => r.crop.id === selectedRec.crop.id);
      if (!isStillVisible) {
        setSelectedRec(null);
      }
    }
  }, [filteredRecommendations, selectedRec?.crop.id]);

  // Planting Advisory Crop
  const [selectedPlantingCropId, setSelectedPlantingCropId] = useState<string>('maize');
  const [plantingAdvisory, setPlantingAdvisory] = useState<PlantingAdvisory | null>(null);

  // Harvest Advisory variables
  const [selectedHarvestCropId, setSelectedHarvestCropId] = useState<string>('maize');
  const [plantingMonthForHarvest, setPlantingMonthForHarvest] = useState<number>(4); // Default: April
  const [harvestAdvisory, setHarvestAdvisory] = useState<HarvestAdvisory | null>(null);

  // Active Tab state for standard conditional rendering (used inside shadcn Tabs value)
  const [activeTab, setActiveTab] = useState<string>('suitability');

  // USSD Simulator
  const ussdSessionRef = useRef<string>('demo-init');
  const [ussdAccText, setUssdAccText] = useState<string>('');
  const [ussdCurrentInput, setUssdCurrentInput] = useState<string>('');
  const [ussdResponse, setUssdResponse] = useState<string>('');
  const [ussdEnded, setUssdEnded] = useState<boolean>(false);

  // Update data when region or variables change
  useEffect(() => {
    const zoneId = REGION_TO_ZONE[selectedRegionId] || 'northern';
    const baseRegion = REGIONS.find((r) => r.id === zoneId) || REGIONS[0];
    const meta = REGION_METADATA[selectedRegionId] || REGION_METADATA['GHNP'];

    setSelectedRegion({
      ...baseRegion,
      name: meta.name,
      capital: meta.capital,
      description: meta.description,
    });

    // Update crop recommendations using zoneId
    const recs = recommendCrops(zoneId, currentMonth);
    setRecommendations(recs);
    if (recs.length > 0) {
      setSelectedRec(recs[0]);
    }

    // Update planting advisory using zoneId
    const adv = getPlantingAdvisory(zoneId, selectedPlantingCropId, new Date(2026, currentMonth - 1, 15));
    setPlantingAdvisory(adv);

    // Update harvest advisory using zoneId
    const plantingDateStr = `2026-${String(plantingMonthForHarvest).padStart(2, '0')}-01`;
    const hAdv = getHarvestAdvisory(zoneId, selectedHarvestCropId, plantingDateStr);
    setHarvestAdvisory(hAdv);
  }, [selectedRegionId, currentMonth, selectedPlantingCropId, selectedHarvestCropId, plantingMonthForHarvest]);

  // Risk Alerts for selected zone
  const activeAlerts = RISK_ALERTS.filter((a) => a.regionId === (REGION_TO_ZONE[selectedRegionId] || 'northern'));

  // Initialize USSD simulator once on mount
  useEffect(() => {
    const id = 'demo-' + Date.now();
    ussdSessionRef.current = id;
    const r = processUSSDRequest(id, '+233244000000', '');
    setUssdResponse(r.replace(/^CON /, '').replace(/^END /, ''));
  }, []);

  const handleUssdSend = () => {
    if (!ussdCurrentInput.trim() || ussdEnded) return;
    const newText = ussdAccText ? `${ussdAccText}*${ussdCurrentInput.trim()}` : ussdCurrentInput.trim();
    const response = processUSSDRequest(ussdSessionRef.current, '+233244000000', newText);
    const isEnd = response.startsWith('END ');
    setUssdAccText(newText);
    setUssdResponse(response.replace(/^CON /, '').replace(/^END /, ''));
    setUssdCurrentInput('');
    setUssdEnded(isEnd);
  };

  const handleUssdReset = () => {
    const id = 'demo-' + Date.now();
    ussdSessionRef.current = id;
    setUssdAccText('');
    setUssdCurrentInput('');
    setUssdEnded(false);
    const r = processUSSDRequest(id, '+233244000000', '');
    setUssdResponse(r.replace(/^CON /, '').replace(/^END /, ''));
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8 bg-background text-foreground transition-colors duration-300">
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between border-b border-agri-green-100 dark:border-agri-green-700/30 pb-5 mb-8 gap-3">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 p-2.5 bg-agri-green-600 dark:bg-agri-green-700 text-white rounded-2xl glow-green">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M17.657 5.657l-11.314 11.314M20.121 11.243a8.001 8.001 0 11-12.728 0m12.728 0a9 9 0 00-11.314 0" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-agri-green-900 dark:text-white leading-none">Akuafo AI</h1>
              <Badge variant="outline" className="border-ochre-500/30 text-ochre-600 dark:text-ochre-500 font-bold bg-ochre-50/50 dark:bg-ochre-100/10 text-[10px] shrink-0">
                v1.1
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">Ghanaian Agricultural Intelligence Platform</p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="shrink-0 flex items-center gap-2 bg-agri-green-50 dark:bg-agri-green-50/5 px-3 py-2 rounded-xl border border-agri-green-100 dark:border-agri-green-700/20">
          <span className="hidden sm:block text-[10px] font-bold text-agri-green-600 dark:text-agri-green-700 uppercase tracking-wider">Month:</span>
          <Select 
            value={String(currentMonth)} 
            onValueChange={(val) => { if (val) setCurrentMonth(Number(val)); }}
          >
            <SelectTrigger className="bg-white dark:bg-zinc-900 border border-agri-green-100 dark:border-agri-green-700/40 text-sm font-semibold rounded-lg px-3 py-1 focus:ring-2 focus:ring-agri-green-600 w-[72px]">
              <span>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][currentMonth - 1]}</span>
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                <SelectItem key={m} value={String(idx + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* DETAILED EARLY ALERT SYSTEM BAR utilizando shadcn Alert */}
      {activeAlerts.length > 0 && (
        <div className="mb-8 space-y-3">
          {activeAlerts.map((alert) => (
            <Alert 
              key={alert.id}
              className={`border rounded-2xl relative shadow-sm transition-all duration-300 ${
                alert.severity === 'Critical' 
                  ? 'border-red-200/80 bg-gradient-to-r from-red-50/90 to-red-50/40 dark:from-red-950/20 dark:to-red-950/5 dark:border-red-900/40' 
                  : 'border-amber-200/80 bg-gradient-to-r from-amber-50/90 to-amber-50/40 dark:from-amber-950/20 dark:to-amber-950/5 dark:border-amber-900/40'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className={`mt-0.5 p-2 rounded-xl shadow-sm border ${
                  alert.severity === 'Critical'
                    ? 'bg-red-100 dark:bg-red-950/60 border-red-200/50 dark:border-red-800/30 text-red-600 dark:text-red-400'
                    : 'bg-amber-100 dark:bg-amber-950/60 border-amber-200/50 dark:border-amber-800/30 text-amber-600 dark:text-amber-400'
                }`}>
                  {alert.severity === 'Critical' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                    </svg>
                  )}
                </span>
                <div className="flex-1">
                  <AlertTitle className={`font-extrabold text-sm flex items-center gap-2 ${
                    alert.severity === 'Critical' 
                      ? 'text-red-950 dark:text-red-200' 
                      : 'text-amber-950 dark:text-amber-200'
                  }`}>
                    {alert.title}
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider shadow-sm border ${
                      alert.severity === 'Critical'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-amber-500 text-white border-amber-500'
                    }`}>
                      {alert.severity}
                    </span>
                  </AlertTitle>
                  <AlertDescription className={`text-xs mt-1.5 leading-relaxed font-semibold ${
                    alert.severity === 'Critical' 
                      ? 'text-red-800 dark:text-red-300' 
                      : 'text-amber-800 dark:text-amber-300'
                  }`}>
                    {alert.message}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`text-[9px] font-black tracking-wider ${
                        alert.severity === 'Critical' 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        MITIGATION CHECKS:
                      </span>
                      {alert.actionSteps.map((step, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg transition-colors border ${
                            alert.severity === 'Critical'
                              ? 'bg-red-100/40 dark:bg-red-950/30 border-red-200/50 dark:border-red-800/30 text-red-800 dark:text-red-300 hover:bg-red-100/60 dark:hover:bg-red-950/50'
                              : 'bg-amber-100/40 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/50'
                          }`}
                        >
                          {step}
                        </Badge>
                      ))}
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* DASHBOARD CONTAINER GRID (2 COLUMNS SIDE-BY-SIDE ON DESKTOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: UNIFIED INPUT MAP & SOIL PROFILE CARD (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="glass-panel bg-transparent ring-0 border-none rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-lg font-extrabold text-agri-green-900 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-agri-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.792 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Agro-Zone & Soil Profile
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">Choose a location and view soil profile metrics</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-6 pb-6">
              {/* Collapsible Soil Header */}
              <button
                type="button"
                onClick={() => setIsSoilExpanded(!isSoilExpanded)}
                className="w-full flex items-center justify-between py-1.5 text-agri-green-900 dark:text-white hover:text-agri-green-700 dark:hover:text-agri-green-300 font-extrabold text-sm transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-agri-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.7A11.96 11.96 0 004.5 12c0 6.6 5.4 12 12 12s12-5.4 12-12-5.4-12-12-12z" />
                  </svg>
                  <span>Soil & Moisture Properties</span>
                </div>
                {isSoilExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Soil & Moisture Properties Section */}
              {isSoilExpanded && (
                <div className="space-y-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-gray-600 dark:text-gray-300">Texture Category:</span>
                      <span className="font-extrabold text-agri-green-700 dark:text-agri-green-600">{selectedRegion.soilProfile.texture}</span>
                    </div>
                    {/* Custom multi-color NPK / texture split bar */}
                    <div className="grid grid-cols-3 gap-1 h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                      <div 
                        title={`Sand: ${selectedRegion.soilProfile.sand}%`} 
                        style={{ width: `${selectedRegion.soilProfile.sand}%` }} 
                        className="bg-yellow-400 h-full"
                      />
                      <div 
                        title={`Silt: ${selectedRegion.soilProfile.silt}%`} 
                        style={{ width: `${selectedRegion.soilProfile.silt}%` }} 
                        className="bg-amber-600 h-full"
                      />
                      <div 
                        title={`Clay: ${selectedRegion.soilProfile.clay}%`} 
                        style={{ width: `${selectedRegion.soilProfile.clay}%` }} 
                        className="bg-red-800 h-full"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>Sand: {selectedRegion.soilProfile.sand}%</span>
                      <span>Silt: {selectedRegion.soilProfile.silt}%</span>
                      <span>Clay: {selectedRegion.soilProfile.clay}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/40 dark:bg-black/10 rounded-2xl p-3 border border-agri-green-100/50 dark:border-agri-green-700/20 text-center">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-bold">SOIL pH LEVEL</span>
                      <span className="text-xl font-black text-agri-green-900 dark:text-white">{selectedRegion.soilProfile.ph}</span>
                      <span className="text-[9px] text-gray-400 block mt-1 uppercase font-bold">
                        {selectedRegion.soilProfile.ph < 6.5 ? 'Acidic' : selectedRegion.soilProfile.ph > 7.0 ? 'Alkaline' : 'Neutral'}
                      </span>
                    </div>
                    <div className="bg-white/40 dark:bg-black/10 rounded-2xl p-3 border border-agri-green-100/50 dark:border-agri-green-700/20 text-center">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-bold">ORGANIC MATTER</span>
                      <span className="text-xl font-black text-agri-green-900 dark:text-white">{selectedRegion.soilProfile.organicMatter}%</span>
                      <span className="text-[9px] text-gray-400 block mt-1 uppercase font-bold">
                        {selectedRegion.soilProfile.organicMatter > 2.5 ? 'Rich Organic' : 'Low Organic'}
                      </span>
                    </div>
                  </div>

                  {/* NPK Values utilizing shadcn Progress */}
                  <div className="bg-white/50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-agri-green-100/50 dark:border-agri-green-700/20">
                    <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Macro-Nutrients (NPK)</h4>
                    <div className="space-y-2.5">
                      {/* Nitrogen */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold text-gray-600 dark:text-gray-400">Nitrogen (N)</span>
                          <span className="font-bold text-agri-green-700 dark:text-agri-green-600">{selectedRegion.soilProfile.nitrogen} mg/kg</span>
                        </div>
                        <Progress value={Math.min(100, (selectedRegion.soilProfile.nitrogen / 120) * 100)} className="h-1.5 bg-gray-200 dark:bg-zinc-800 text-agri-green-600" />
                      </div>
                      {/* Phosphorus */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold text-gray-600 dark:text-gray-400">Phosphorus (P)</span>
                          <span className="font-bold text-agri-green-700 dark:text-agri-green-600">{selectedRegion.soilProfile.phosphorus} mg/kg</span>
                        </div>
                        <Progress value={Math.min(100, (selectedRegion.soilProfile.phosphorus / 30) * 100)} className="h-1.5 bg-gray-200 dark:bg-zinc-800 text-agri-green-600" />
                      </div>
                      {/* Potassium */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold text-gray-600 dark:text-gray-400">Potassium (K)</span>
                          <span className="font-bold text-agri-green-700 dark:text-agri-green-600">{selectedRegion.soilProfile.potassium} mg/kg</span>
                        </div>
                        <Progress value={Math.min(100, (selectedRegion.soilProfile.potassium / 220) * 100)} className="h-1.5 bg-gray-200 dark:bg-zinc-800 text-agri-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Divider Line */}
              <div className="border-t border-agri-green-100/50 dark:border-agri-green-700/20 my-1" />

              {/* Ghana Map */}
              <GhanaMap 
                selectedRegionId={selectedRegionId} 
                onSelectRegion={setSelectedRegionId} 
              />
              
              {/* Region Details */}
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/10 border border-agri-green-100 dark:border-agri-green-700/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-sm text-agri-green-900 dark:text-white">
                    {selectedRegion.name} Region
                  </span>
                  <Badge variant="outline" className="text-[9px] font-bold py-0 h-4 border-none bg-agri-green-50 dark:bg-zinc-900 text-agri-green-600 dark:text-agri-green-700">
                    Capital: {selectedRegion.capital}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {selectedRegion.description}
                </p>
              </div>
              {/* Data Attribution */}
              <p className="text-[9px] text-gray-400 dark:text-gray-600 text-center leading-relaxed pt-1">
                Soil &amp; rainfall data: representative agro-ecological profiles — MoFA Ghana · GMet · FAO
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: MAIN SHADCN TABS CONTAINER & CONTENT (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 bg-agri-green-50 dark:bg-agri-green-50/5 p-1 rounded-2xl border border-agri-green-100 dark:border-agri-green-700/20 !h-12 gap-1.5 w-full">
              <TabsTrigger value="suitability" className="h-10 text-[11px] sm:text-xs md:text-sm font-extrabold rounded-xl cursor-pointer transition-all">
                Suitability
              </TabsTrigger>
              <TabsTrigger value="calendar" className="h-10 text-[11px] sm:text-xs md:text-sm font-extrabold rounded-xl cursor-pointer transition-all">
                Calendar
              </TabsTrigger>
              <TabsTrigger value="harvest" className="h-10 text-[11px] sm:text-xs md:text-sm font-extrabold rounded-xl cursor-pointer transition-all">
                Harvest
              </TabsTrigger>
              <TabsTrigger value="ussd" className="h-10 text-[11px] sm:text-xs md:text-sm font-extrabold rounded-xl cursor-pointer transition-all">
                USSD
              </TabsTrigger>
              <TabsTrigger value="api" className="h-10 text-[11px] sm:text-xs md:text-sm font-extrabold rounded-xl cursor-pointer transition-all">
                APIs
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT 1: CROP SUITABILITY */}
            <TabsContent value="suitability" className="space-y-6 mt-6">
              <Card className="glass-panel bg-transparent ring-0 border-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-3 px-6 pt-6">
                  <CardTitle className="text-lg font-extrabold text-agri-green-900 dark:text-white">Crop Suitability AI Matcher</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Evaluates soil composition and rainfall forecast for Month {currentMonth}. &nbsp;·&nbsp; <span className="italic">Agronomic rules engine — ML model integration pending.</span></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  {/* Search and Group Filters */}
                  <div className="space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search crops (e.g. Maize, Cocoa, Legon)..."
                        className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-agri-green-100 dark:border-agri-green-700/20 bg-white/40 dark:bg-black/10 focus:outline-none focus:ring-1 focus:ring-agri-green-600 transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {CATEGORIES.map((cat) => {
                        const isActive = selectedCategory === cat.value;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`px-3.5 py-1.5 text-[10px] font-extrabold rounded-full transition-all cursor-pointer border ${
                              isActive
                                ? 'bg-agri-green-700 text-white border-agri-green-700 shadow-sm'
                                : 'bg-white/40 border-agri-green-100/50 hover:bg-white/70 dark:bg-black/10 dark:border-agri-green-700/15 dark:hover:bg-zinc-800/30 text-agri-green-700 dark:text-agri-green-300'
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Crop List */}
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1.5">
                    {filteredRecommendations.length > 0 ? (
                      filteredRecommendations.map((rec) => {
                        const isSelected = selectedRec?.crop.id === rec.crop.id;
                        const suitabilityColors = {
                          High: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/40',
                          Moderate: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/40',
                          Low: 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200/40'
                        };

                        return (
                          <div 
                            key={rec.crop.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedRec(null);
                              } else {
                                setSelectedRec(rec);
                              }
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-agri-green-50 dark:bg-agri-green-50/10 border-agri-green-600' 
                                : 'bg-white/40 dark:bg-black/10 border-agri-green-100 dark:border-agri-green-700/20 hover:bg-white/70 dark:hover:bg-zinc-800/30'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-agri-green-900 dark:text-white">{rec.crop.name}</span>
                                <span className="text-[10px] text-gray-400">({rec.crop.category})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[10px] font-bold py-0.5 px-2 h-5 rounded-full border ${suitabilityColors[rec.suitability]}`}>
                                  {rec.suitability} ({rec.score}%)
                                </Badge>
                                {isSelected ? (
                                  <ChevronUp className="w-4 h-4 text-agri-green-600 dark:text-agri-green-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs mt-2 text-gray-500 dark:text-gray-400">
                              <span>Price: <strong className="text-agri-green-700 dark:text-agri-green-600">GH₵{rec.crop.marketPriceGhS}</strong> / {rec.crop.priceUnit}</span>
                              <span className="text-[10px] bg-agri-green-100/50 dark:bg-zinc-950 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Demand: {rec.crop.marketDemand}</span>
                            </div>

                            {/* Inline Collapsible Details */}
                            {isSelected && (
                              <div 
                                onClick={(e) => e.stopPropagation()} 
                                className="mt-4 pt-4 border-t border-agri-green-200/40 dark:border-agri-green-700/20 space-y-4 cursor-default"
                              >
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                    {rec.crop.description}
                                  </p>
                                </div>
                                
                                <div>
                                  <h5 className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2">Matching Strengths</h5>
                                  <ul className="space-y-1.5">
                                    {rec.reasons.map((r, idx) => (
                                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                                        <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                                        <span>{r}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {rec.warnings.length > 0 && (
                                  <div>
                                    <h5 className="text-[10px] font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-2">Climate & Soil Warnings</h5>
                                    <ul className="space-y-1.5">
                                      {rec.warnings.map((w, idx) => (
                                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                                          <span className="text-amber-500 font-bold mt-0.5">⚠</span>
                                          <span>{w}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 text-xs text-gray-400 dark:text-gray-500 bg-white/20 dark:bg-black/5 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800/40">
                        No crops match search query or category filters.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT 2: PLANTING CALENDAR */}
            <TabsContent value="calendar" className="space-y-6 mt-6">
              <Card className="glass-panel bg-transparent ring-0 border-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-3 px-6 pt-6">
                  <CardTitle className="text-lg font-extrabold text-agri-green-900 dark:text-white">Planting Calendar Optimizer</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Calculates optimal seed sowing window according to rain forecasts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-6">
                  
                  {/* Selectors utilizing shadcn Select */}
                  <div className="bg-white/40 dark:bg-black/10 p-4 rounded-2xl border border-agri-green-100/50 dark:border-agri-green-700/20 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block mb-1">Target Crop:</label>
                      <Select 
                        value={selectedPlantingCropId}
                        onValueChange={(val) => { if (val) setSelectedPlantingCropId(val); }}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-zinc-900 border border-agri-green-100 dark:border-agri-green-700/40 text-xs font-semibold rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-agri-green-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground">
                          {CROPS.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block mb-1.5">Moisture Status:</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-3 h-3 rounded-full ${
                          plantingAdvisory?.soilMoistureStatus === 'Adequate' ? 'bg-emerald-500 animate-pulse-slow' :
                          plantingAdvisory?.soilMoistureStatus === 'Saturated' ? 'bg-blue-600 animate-pulse-slow' : 'bg-red-500 animate-pulse-slow'
                        }`} />
                        <span className="text-xs font-extrabold text-agri-green-900 dark:text-white">
                          {plantingAdvisory?.soilMoistureStatus} ({plantingAdvisory?.soilMoistureScore}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Bar Chart for weekly rain */}
                  <div className="bg-white/40 dark:bg-black/10 p-4 rounded-2xl border border-agri-green-100/50 dark:border-agri-green-700/20">
                    <h4 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-3">Expected Rainfall Distribution (mm)</h4>
                    <div className="flex items-end justify-between h-20 pt-4 px-2">
                      {plantingAdvisory?.weeklyRainfallForecast.map((rain, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 w-1/4">
                          <span className="text-[10px] font-bold text-agri-green-600 dark:text-agri-green-700">{rain}mm</span>
                          <div 
                            style={{ height: `${Math.max(8, Math.min(60, rain))}px` }} 
                            className="w-8 bg-blue-500/80 dark:bg-blue-600/80 rounded-t-lg transition-all"
                          />
                          <span className="text-[9px] text-gray-400">Week {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sowing advisory details utilizing Progress */}
                  {plantingAdvisory && (
                    <div className="p-4 rounded-2xl bg-agri-green-50 dark:bg-agri-green-50/10 border border-agri-green-600/30">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-xs font-extrabold uppercase tracking-wide text-agri-green-700 dark:text-agri-green-400">Soil Readiness index</span>
                        <span className="text-sm font-black text-agri-green-900 dark:text-white">{plantingAdvisory.readinessIndex}/100</span>
                      </div>
                      <Progress 
                        value={plantingAdvisory.readinessIndex} 
                        className={`h-2 mb-3 bg-gray-200 dark:bg-zinc-800 ${
                          plantingAdvisory.readinessIndex > 75 ? '[&>div]:bg-emerald-600' :
                          plantingAdvisory.readinessIndex > 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                        }`}
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                        {plantingAdvisory.advisoryText}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/70 dark:bg-zinc-950 p-2.5 rounded-xl border border-agri-green-100/30">
                          <span className="text-[9px] text-gray-400 uppercase font-bold block">Start Planting:</span>
                          <strong className="text-agri-green-900 dark:text-white mt-0.5 block">{plantingAdvisory.optimalWindowStart}</strong>
                        </div>
                        <div className="bg-white/70 dark:bg-zinc-950 p-2.5 rounded-xl border border-agri-green-100/30">
                          <span className="text-[9px] text-gray-400 uppercase font-bold block">Sow Before:</span>
                          <strong className="text-agri-green-900 dark:text-white mt-0.5 block">{plantingAdvisory.optimalWindowEnd}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT 3: HARVEST PLANNER */}
            <TabsContent value="harvest" className="space-y-6 mt-6">
              <Card className="glass-panel bg-transparent ring-0 border-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-3 px-6 pt-6">
                  <CardTitle className="text-lg font-extrabold text-agri-green-900 dark:text-white">Harvest Window Optimizer</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Flags dry spells for harvest timing and minimizes crop rot.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-6">
                  
                  {/* Selectors utilizing shadcn Select */}
                  <div className="bg-white/40 dark:bg-black/10 p-4 rounded-2xl border border-agri-green-100/50 dark:border-agri-green-700/20 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block mb-1">Harvest Crop:</label>
                      <Select 
                        value={selectedHarvestCropId}
                        onValueChange={(val) => { if (val) setSelectedHarvestCropId(val); }}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-zinc-900 border border-agri-green-100 dark:border-agri-green-700/40 text-xs font-semibold rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-agri-green-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground">
                          {CROPS.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block mb-1">Planted Month:</label>
                      <Select 
                        value={String(plantingMonthForHarvest)}
                        onValueChange={(val) => { if (val) setPlantingMonthForHarvest(Number(val)); }}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-zinc-900 border border-agri-green-100 dark:border-agri-green-700/40 text-xs font-semibold rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-agri-green-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground">
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                            <SelectItem key={m} value={String(idx + 1)}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {harvestAdvisory && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/40 dark:bg-black/10 p-3 rounded-2xl border border-agri-green-100/50 dark:border-zinc-800 text-center">
                          <span className="text-[9px] text-gray-500 block font-bold uppercase tracking-wider">Rotting Risk</span>
                          <Badge 
                            variant="outline" 
                            className={`text-[9px] font-black uppercase py-0 px-2 mt-1.5 inline-block ${
                              harvestAdvisory.rotRisk === 'High' ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200/50' :
                              harvestAdvisory.rotRisk === 'Medium' ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-200/50' :
                              'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200/50'
                            }`}
                          >
                            {harvestAdvisory.rotRisk}
                          </Badge>
                        </div>
                        <div className="bg-white/40 dark:bg-black/10 p-3 rounded-2xl border border-agri-green-100/50 dark:border-zinc-800 text-center">
                          <span className="text-[9px] text-gray-500 block font-bold uppercase tracking-wider">Dry Days</span>
                          <span className="text-sm font-black block mt-1 text-agri-green-900 dark:text-white">
                            {harvestAdvisory.daysOfDrySpell} / 14
                          </span>
                        </div>
                        <div className="bg-white/40 dark:bg-black/10 p-3 rounded-2xl border border-agri-green-100/50 dark:border-zinc-800 text-center">
                          <span className="text-[9px] text-gray-500 block font-bold uppercase tracking-wider">Period Rain</span>
                          <span className="text-sm font-black block mt-1 text-agri-green-900 dark:text-white">
                            {harvestAdvisory.forecastedRainDuringWindow} mm
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-agri-green-50 dark:bg-agri-green-50/10 border border-agri-green-600/30">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Maturity Window Estimate</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-b border-agri-green-100/30 mb-2">
                          <div>
                            <span className="text-[9px] text-gray-400 font-medium block">Physiological Maturity:</span>
                            <strong className="text-agri-green-900 dark:text-white">{harvestAdvisory.physiologicalMaturityDate}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 font-medium block">Harvest Window:</span>
                            <strong className="text-agri-green-900 dark:text-white">{harvestAdvisory.harvestWindowStart} - {harvestAdvisory.harvestWindowEnd}</strong>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                          {harvestAdvisory.advisoryText}
                        </p>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT 4: USSD ADVISORY GUIDE */}
            <TabsContent value="ussd" className="space-y-4 mt-6">

              {/* ── LIVE USSD SIMULATOR ── */}
              <Card className="glass-panel bg-transparent ring-0 border-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-3 px-6 pt-6">
                  <CardTitle className="text-lg font-extrabold text-agri-green-900 dark:text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-agri-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                    Live USSD Simulator
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Walk through the <strong className="text-agri-green-700 dark:text-agri-green-600">*902#</strong> session flow that farmers use on any basic phone — no internet required.
                  </CardDescription>
                  <div className="mt-2 flex items-start gap-2 px-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-500 mt-0.5 shrink-0">Simulation</span>
                    <p className="text-[10px] text-amber-700/80 dark:text-amber-500/70 italic leading-relaxed">
                      This is a web-based simulation of the USSD session flow. Live <strong>*902#</strong> access via mobile networks (MTN, Telecel, AT) is under development and pending integration with Africa's Talking.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="rounded-2xl overflow-hidden border border-gray-800">

                    {/* Status bar */}
                    <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between border-b border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          ussdEnded ? 'bg-red-500' : 'bg-green-500 animate-pulse'
                        }`} />
                        <span className="text-green-400 font-mono text-xs font-bold tracking-widest">*902#</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                        {ussdEnded ? '● Session Ended' : '● Session Active'}
                      </span>
                    </div>

                    {/* USSD Screen */}
                    <div className="p-5 min-h-[160px] font-mono text-[11px] text-green-300 whitespace-pre-line leading-[1.75] bg-gray-950">
                      {ussdResponse || 'Connecting...'}
                    </div>

                    {/* Input row */}
                    {!ussdEnded ? (
                      <div className="border-t border-gray-800 bg-gray-900 px-4 py-3 flex items-center gap-3">
                        <span className="text-gray-600 font-mono text-sm select-none">›</span>
                        <input
                          type="text"
                          value={ussdCurrentInput}
                          onChange={(e) => setUssdCurrentInput(e.target.value.replace(/[^0-9]/g, ''))}
                          onKeyDown={(e) => e.key === 'Enter' && handleUssdSend()}
                          placeholder="Type option number and press Enter..."
                          maxLength={2}
                          className="flex-1 bg-transparent text-green-300 text-xs font-mono border-none focus:outline-none placeholder-gray-700 caret-green-400"
                        />
                        <button
                          onClick={handleUssdSend}
                          disabled={!ussdCurrentInput.trim()}
                          className="px-3.5 py-1.5 bg-green-800 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-600 text-green-200 text-[10px] font-bold rounded-lg transition-colors font-mono uppercase tracking-wide cursor-pointer disabled:cursor-not-allowed"
                        >
                          Send
                        </button>
                      </div>
                    ) : (
                      <div className="border-t border-gray-800 bg-gray-900 px-4 py-3 text-center text-[10px] text-red-400 font-mono">
                        ● Session terminated
                      </div>
                    )}

                    {/* Footer with session trace + reset */}
                    <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 flex items-center justify-between">
                      <span className="text-[9px] text-gray-700 font-mono">
                        Input sequence: <span className="text-gray-600">{ussdAccText || '(new session)'}</span>
                      </span>
                      <button
                        onClick={handleUssdReset}
                        className="text-[10px] text-green-600 hover:text-green-400 font-mono font-bold transition-colors cursor-pointer"
                      >
                        ↺ Redial *902#
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── USSD INFO CARD ── */}
              <Card className="glass-panel bg-transparent ring-0 border-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-3 px-6 pt-6">
                  <CardTitle className="text-lg font-extrabold text-agri-green-900 dark:text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-agri-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                    Akuafo USSD Offline Directory
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Dial <strong className="text-agri-green-700 dark:text-agri-green-600 font-bold">*902#</strong> to access offline agronomic recommendations from any phone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-6 text-xs text-gray-600 dark:text-gray-300">

                  {/* Step-by-Step Instructions */}
                  <div className="bg-white/40 dark:bg-black/10 p-4 rounded-2xl border border-agri-green-100/50 dark:border-agri-green-700/20">
                    <h4 className="font-extrabold text-sm text-agri-green-900 dark:text-white mb-3">How to Access USSD Advisory</h4>
                    <ol className="space-y-3 list-decimal list-inside pl-1 text-[11px] leading-relaxed">
                      <li>
                        <strong className="text-agri-green-700 dark:text-agri-green-500">Dial *902#</strong> on any mobile device (supports MTN, Telecel, and AT networks).
                      </li>
                      <li>
                        <strong className="text-agri-green-700 dark:text-agri-green-500">Choose Region</strong>: Reply with the menu number matching your administrative zone.
                      </li>
                      <li>
                        <strong className="text-agri-green-700 dark:text-agri-green-500">Select Advisory Service</strong>:
                        <ul className="list-disc list-inside pl-4 mt-1 text-gray-500 dark:text-gray-400 space-y-0.5">
                          <li>1. Crop Suitability Recommendations</li>
                          <li>2. Optimal Planting Sowing Windows</li>
                          <li>3. Harvest Rotation timelines</li>
                          <li>4. Regional Environmental Risk Alerts</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-agri-green-700 dark:text-agri-green-500">Receive SMS Report</strong>: Submit your crop inputs to receive instant offline summaries.
                      </li>
                    </ol>
                  </div>

                  {/* Offline Directory Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/40 dark:bg-black/10 p-3.5 rounded-2xl border border-agri-green-100/50 dark:border-agri-green-700/20">
                      <span className="font-extrabold text-[10px] text-agri-green-700 dark:text-agri-green-500 uppercase tracking-wider block mb-1">100% Offline</span>
                      <p className="text-[10px] text-gray-500 leading-normal">Works without active mobile data, internet connection, or smartphone requirements.</p>
                    </div>
                    <div className="bg-white/40 dark:bg-black/10 p-3.5 rounded-2xl border border-agri-green-100/50 dark:border-agri-green-700/20">
                      <span className="font-extrabold text-[10px] text-agri-green-700 dark:text-agri-green-500 uppercase tracking-wider block mb-1">No-Cost Dialing</span>
                      <p className="text-[10px] text-gray-500 leading-normal">Zero billing. Navigation and access to localized crop recommendations are entirely free.</p>
                    </div>
                    <div className="bg-white/40 dark:bg-black/10 p-3.5 rounded-2xl border border-agri-green-100/50 dark:border-agri-green-700/20">
                      <span className="font-extrabold text-[10px] text-agri-green-700 dark:text-agri-green-500 uppercase tracking-wider block mb-1">Last-Mile Access</span>
                      <p className="text-[10px] text-gray-500 leading-normal">Reaches remote farmers on legacy feature phones to democratize agricultural AI tools.</p>
                    </div>
                  </div>

                  {/* REST Developer API Node */}
                  <div className="bg-white/50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-agri-green-100/50 dark:border-agri-green-700/20">
                    <h5 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Developer Integration Endpoint</h5>
                    <p className="text-[10px] text-gray-500 leading-normal mb-3">
                      Integrators can hook into this USSD service by sending standard Telco USSD session payload sequences.
                    </p>
                    <div className="bg-white/40 dark:bg-black/15 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge variant="outline" className="font-extrabold text-[9px] text-emerald-600 bg-emerald-50 dark:bg-zinc-900 border-emerald-200/40">POST</Badge>
                        <code className="text-agri-green-900 dark:text-white font-mono text-[10px]">/api/ussd</code>
                      </div>
                      <p className="text-[9px] font-mono text-gray-400">Body Payload: &#123; sessionId: string, phoneNumber: string, text: string &#125;</p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT 5: DEVELOPER API INFO */}
            <TabsContent value="api" className="space-y-4 mt-6">
              <Card className="glass-panel bg-transparent ring-0 border-none rounded-3xl overflow-hidden">
                <CardHeader className="pb-3 px-6 pt-6">
                  <CardTitle className="text-lg font-extrabold text-agri-green-900 dark:text-white">Agronomic API Platform</CardTitle>
                  <CardDescription className="text-xs text-gray-500 leading-relaxed">REST endpoints exposing Akuafo AI's agronomic engine for integration into mobile apps, USSD gateways, and third-party agritech platforms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-6 text-xs">

                  {/* Prototype Status Notice */}
                  <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-500">Intelligence Layer:</span>
                      <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-700/30">Agronomic Rules Engine (Prototype)</span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-600 italic">· ML model integration pending</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-500">Data:</span>
                      <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-700/30">Representative Regional Profiles (Prototype)</span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-600 italic">· Live ETL integration pending</span>
                    </div>
                  </div>

                  <div className="bg-agri-green-50 dark:bg-agri-green-50/5 p-4 rounded-2xl border border-agri-green-100 dark:border-agri-green-700/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-black text-agri-green-600 dark:text-agri-green-500 uppercase tracking-wider block mb-1">Base URL</span>
                        <code className="font-mono text-[11px] text-agri-green-900 dark:text-white bg-white/60 dark:bg-black/20 px-2 py-1 rounded-lg border border-agri-green-100/50 dark:border-agri-green-700/20 block">
                          https://api.akuafo.ai/api
                        </code>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-agri-green-600 dark:text-agri-green-500 uppercase tracking-wider block mb-1">Authentication</span>
                        <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                          API Key via <code className="font-mono bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded border border-gray-200/50 dark:border-zinc-700/30">X-API-Key</code> header
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-agri-green-100/50 dark:border-agri-green-700/20 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 shrink-0">ℹ</span>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">All responses return <code className="font-mono">application/json</code>. Prototype endpoints do not require authentication. Production keys will be issued upon registration.</p>
                    </div>
                  </div>

                  {/* Endpoint 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-extrabold text-[9px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50">GET</Badge>
                      <code className="text-agri-green-900 dark:text-white font-mono text-[11px] font-bold">/api/recommendations/crop</code>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">Returns a ranked list of crop recommendations for a given agro-zone and planting month. Scores are computed from soil composition, rainfall forecast, and market demand data.</p>
                    <div className="bg-white/40 dark:bg-black/15 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Query Parameters</p>
                      <div className="grid grid-cols-3 gap-y-1.5 text-[10px]">
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">region</code>
                        <span className="col-span-2 text-gray-500">Zone ID — <code className="font-mono">northern</code>, <code className="font-mono">ashanti</code>, <code className="font-mono">volta</code>, <code className="font-mono">greater-accra</code></span>
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">month</code>
                        <span className="col-span-2 text-gray-500">Integer 1–12 representing the target planting month</span>
                      </div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mt-2">Example Response</p>
                      <pre className="font-mono text-[9px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-2 overflow-x-auto leading-relaxed">{`[\n  { "crop": "Maize", "suitability": "High", "score": 91 },\n  { "crop": "Sorghum", "suitability": "Moderate", "score": 73 }\n]`}</pre>
                    </div>
                  </div>

                  {/* Endpoint 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-extrabold text-[9px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50">GET</Badge>
                      <code className="text-agri-green-900 dark:text-white font-mono text-[11px] font-bold">/api/recommendations/planting</code>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">Returns the optimal planting window for a specific crop and region, including a soil readiness index, moisture status, and a 4-week rainfall forecast.</p>
                    <div className="bg-white/40 dark:bg-black/15 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Query Parameters</p>
                      <div className="grid grid-cols-3 gap-y-1.5 text-[10px]">
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">region</code>
                        <span className="col-span-2 text-gray-500">Zone ID e.g. <code className="font-mono">ashanti</code></span>
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">crop</code>
                        <span className="col-span-2 text-gray-500">Crop slug e.g. <code className="font-mono">maize</code>, <code className="font-mono">cocoa</code>, <code className="font-mono">rice</code></span>
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">date</code>
                        <span className="col-span-2 text-gray-500">ISO date string e.g. <code className="font-mono">2026-06-15</code></span>
                      </div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mt-2">Example Response</p>
                      <pre className="font-mono text-[9px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-2 overflow-x-auto leading-relaxed">{`{\n  "readinessIndex": 82,\n  "optimalWindowStart": "June 10",\n  "optimalWindowEnd": "June 28",\n  "soilMoistureStatus": "Adequate",\n  "weeklyRainfallForecast": [42, 55, 38, 29]\n}`}</pre>
                    </div>
                  </div>

                  {/* Endpoint 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-extrabold text-[9px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50">GET</Badge>
                      <code className="text-agri-green-900 dark:text-white font-mono text-[11px] font-bold">/api/recommendations/harvest</code>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">Predicts the optimal harvest window for a crop given its planting date, flags rotting risk from projected rainfall, and returns the estimated ready date and dry day count.</p>
                    <div className="bg-white/40 dark:bg-black/15 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Query Parameters</p>
                      <div className="grid grid-cols-3 gap-y-1.5 text-[10px]">
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">region</code>
                        <span className="col-span-2 text-gray-500">Zone ID e.g. <code className="font-mono">northern</code></span>
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">crop</code>
                        <span className="col-span-2 text-gray-500">Crop slug e.g. <code className="font-mono">yam</code>, <code className="font-mono">cassava</code></span>
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">planted</code>
                        <span className="col-span-2 text-gray-500">ISO date planted e.g. <code className="font-mono">2026-03-01</code></span>
                      </div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mt-2">Example Response</p>
                      <pre className="font-mono text-[9px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-2 overflow-x-auto leading-relaxed">{`{\n  "harvestReadyDate": "October 5, 2026",\n  "dryDaysAvailable": 18,\n  "rotRisk": "Low",\n  "advisoryText": "Harvest before late-October rains."\n}`}</pre>
                    </div>
                  </div>

                  {/* Endpoint 4 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-extrabold text-[9px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50">GET</Badge>
                      <Badge variant="outline" className="font-extrabold text-[9px] text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200/50">POST</Badge>
                      <code className="text-agri-green-900 dark:text-white font-mono text-[11px] font-bold">/api/ussd</code>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">USSD gateway handler compatible with Africa's Talking and Hubtel platforms. Processes session state and responds with menu-driven agronomic data, enabling offline access for low-connectivity farmers.</p>
                    <div className="bg-white/40 dark:bg-black/15 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">POST Body Fields</p>
                      <div className="grid grid-cols-3 gap-y-1.5 text-[10px]">
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">sessionId</code>
                        <span className="col-span-2 text-gray-500">Unique session string from USSD gateway</span>
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">phoneNumber</code>
                        <span className="col-span-2 text-gray-500">Farmer MSISDN e.g. <code className="font-mono">+233244000000</code></span>
                        <code className="font-mono text-agri-green-700 dark:text-agri-green-500">text</code>
                        <span className="col-span-2 text-gray-500">Accumulated menu input e.g. <code className="font-mono">1*2*3</code></span>
                      </div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mt-2">Example Response</p>
                      <pre className="font-mono text-[9px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-2 overflow-x-auto leading-relaxed">{`CON Select crop:\n1. Maize\n2. Cassava\n3. Yam\n4. Cocoa`}</pre>
                    </div>
                  </div>

                  {/* Footer Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/40 dark:bg-black/10 p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/40">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Rate Limits</p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed">Prototype: <strong>100 req/min</strong> per IP. Production tier supports up to <strong>10,000 req/min</strong> with burst handling via regional edge nodes.</p>
                    </div>
                    <div className="bg-white/40 dark:bg-black/10 p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/40">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Integration Partners</p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed">Designed for Africa's Talking, Hubtel Gateway, MoMo APIs, and ODK mobile data platforms used by NGOs and agri-extension workers.</p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>

      </div>
    </div>
  );
}
