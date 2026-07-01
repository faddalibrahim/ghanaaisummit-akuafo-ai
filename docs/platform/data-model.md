# Data Model

This document describes the core data structures powering the Akuafo AI platform. All types are defined in [`app/lib/data.ts`](../app/lib/data.ts).

---

## Region

Represents one of Ghana's 4 agro-ecological zones with full soil and climate data.

```typescript
interface Region {
  id: string;                        // e.g. 'northern', 'ashanti'
  name: string;                      // Display name
  capital: string;                   // Zone capital city
  description: string;               // Short ecological description
  soilProfile: SoilProfile;
  rainfallPattern: 'unimodal' | 'bimodal';
  monthlyRainfall: number[];         // 12 values (mm), Jan–Dec
  monthlyTemperature: number[];      // 12 values (°C), Jan–Dec
  riskFactors: RiskFactors;
}
```

### Available Zones

| ID | Name | Capital | Rainfall |
|---|---|---|---|
| `northern` | Northern Region | Tamale | Unimodal (peaks Aug–Sep) |
| `ashanti` | Ashanti Region | Kumasi | Bimodal (Apr–Jul, Sep–Nov) |
| `greater-accra` | Greater Accra | Accra | Bimodal (low) |
| `volta` | Volta Region | Ho | Bimodal |

---

## SoilProfile

Detailed soil chemistry for each agro-zone.

```typescript
interface SoilProfile {
  sand: number;          // % composition
  silt: number;          // % composition
  clay: number;          // % composition
  ph: number;            // Soil pH (0–14)
  organicMatter: number; // % organic matter
  nitrogen: number;      // mg/kg
  phosphorus: number;    // mg/kg
  potassium: number;     // mg/kg
  texture: string;       // 'Sandy Loam' | 'Forest Loam' | 'Heavy Clay' | 'Clay Loam'
}
```

### Zone Soil Profiles

| Zone | pH | Texture | N (mg/kg) | P (mg/kg) | K (mg/kg) | Organic Matter |
|---|---|---|---|---|---|---|
| Northern | 6.2 | Sandy Loam | 45 | 12 | 120 | 1.2% |
| Ashanti | 6.5 | Forest Loam | 110 | 28 | 210 | 3.2% |
| Greater Accra | 7.2 | Heavy Clay | 65 | 18 | 180 | 1.8% |
| Volta | 6.0 | Clay Loam | 85 | 20 | 160 | 2.5% |

---

## Crop

Defines a crop's agronomic requirements, market data, and planting calendar.

```typescript
interface Crop {
  id: string;
  name: string;
  category: string;               // 'Cereal' | 'Legume' | 'Tuber' | 'Vegetable' | 'Cash Crop'
  optimalTempMin: number;         // °C
  optimalTempMax: number;         // °C
  optimalRainMin: number;         // mm (over growth cycle)
  optimalRainMax: number;         // mm
  optimalPhMin: number;
  optimalPhMax: number;
  maturationMonths: number;
  marketDemand: 'Low' | 'Medium' | 'High';
  marketPriceGhS: number;         // Price in Ghana Cedis
  priceUnit: string;              // e.g. '100kg Bag', 'Tonne'
  plantingMonths: number[];       // 1–12 (1 = Jan)
  harvestDryMonths: number[];     // Preferred dry months for harvest
  soilTexturePreferences: string[];
  description: string;
}
```

---

## CropRecommendation

Output of the suitability scoring engine for a single crop.

```typescript
interface CropRecommendation {
  crop: Crop;
  score: number;                        // 0–100
  suitability: 'High' | 'Moderate' | 'Low';
  reasons: string[];                    // Positive matching factors
  warnings: string[];                   // Risk factors and mismatches
}
```

---

## PlantingAdvisory

Output of the planting calendar optimizer.

```typescript
interface PlantingAdvisory {
  soilMoistureStatus: 'Low' | 'Adequate' | 'Saturated';
  soilMoistureScore: number;           // 0–100
  optimalWindowStart: string;          // e.g. '5 Jun'
  optimalWindowEnd: string;            // e.g. '20 Jun'
  weeklyRainfallForecast: number[];    // 4 values (mm per week)
  advisoryText: string;
  readinessIndex: number;              // 0–100
}
```

---

## HarvestAdvisory

Output of the harvest window optimizer.

```typescript
interface HarvestAdvisory {
  physiologicalMaturityDate: string;   // e.g. 'Oct 5, 2026'
  harvestWindowStart: string;
  harvestWindowEnd: string;
  rotRisk: 'Low' | 'Medium' | 'High';
  forecastedRainDuringWindow: number;  // mm
  daysOfDrySpell: number;
  advisoryText: string;
}
```

---

## RiskAlert

Represents an active agro-climate risk warning for a zone.

```typescript
interface RiskAlert {
  id: string;
  type: 'drought' | 'disease' | 'weather' | 'pest';
  title: string;
  severity: 'Info' | 'Warning' | 'Critical';
  message: string;
  regionId: string;                    // Links to a zone ID
  affectedCrops: string[];             // Crop IDs
  actionSteps: string[];               // Mitigation recommendations
}
```

### Active Alerts (Prototype Data)

| ID | Zone | Type | Severity | Title |
|---|---|---|---|---|
| alert-1 | Northern | Drought | Critical | Severe Dry Spell Warning |
| alert-2 | Ashanti | Pest | Warning | Fall Armyworm Infestation Risk |
| alert-3 | Greater Accra | Weather | Warning | Torrential Washout Hazard |
| alert-4 | Volta | Disease | Warning | Black Pod Disease Alert |

---

## RiskFactors

Per-zone risk profile used for regional context.

```typescript
interface RiskFactors {
  drought: 'Low' | 'Medium' | 'High';
  disease: 'Low' | 'Medium' | 'High';
  flood: 'Low' | 'Medium' | 'High';
}
```

| Zone | Drought Risk | Disease Risk | Flood Risk |
|---|---|---|---|
| Northern | High | Low | Medium |
| Ashanti | Low | High | Medium |
| Greater Accra | High | Medium | High |
| Volta | Medium | Medium | Medium |
