# Feature: Crop Suitability AI Matcher

## What It Does

The **Crop Suitability AI Matcher** evaluates every crop in the database against the conditions of the currently selected region and planting month. It produces a ranked, scored list showing which crops are most suitable to grow — and why.

Each crop receives a **suitability score (0–100)** and a label of **High**, **Moderate**, or **Low**.

---

## How to Use It

1. **Select a Region** on the interactive Ghana map (left panel). The region's soil profile and agro-zone update automatically.
2. **Set the Current Month** using the header dropdown (e.g. Jun).
3. Open the **Suitability** tab.
4. **Filter by crop group** using the category pills: Cereals, Legumes, Tubers, Vegetables, Cash Crops.
5. **Search** for a specific crop by name, category, or keyword.
6. **Click any crop card** to expand inline details — including description, matching strengths (✓), and climate/soil warnings (⚠).

---

## Scoring Algorithm

The scoring engine (`recommendCrops()` in `data.ts`) starts every crop at a **baseline of 80 points** and applies five rule-based adjustments:

| Factor | Outcome | Score Change |
|---|---|---|
| **Planting Month Match** | Current month is in the crop's optimal planting windows | +10 |
| | Month is outside planting windows | −25 |
| **Soil Texture Match** | Region soil (e.g. Sandy Loam) matches crop preferences | +10 |
| | Soil type is incompatible | −15 |
| **Soil pH Match** | Region pH falls within crop's optimal range | +5 |
| | pH too low (acidic) | −10 |
| | pH too high (alkaline) | −10 |
| **Temperature Match** | Average cycle temperature within crop's optimal range | +5 |
| | Temperature outside optimal | −15 |
| **Rainfall Match** | Cumulative cycle rainfall within optimal range | +10 |
| | Rainfall deficit | −up to 30 |
| | Rainfall excess | −up to 20 |
| **Market Demand** | High demand crop | +5 |
| | Low demand crop | −5 |

Final score is clamped between **0 and 100**.

### Suitability Thresholds

| Score Range | Label |
|---|---|
| 80–100 | **High** (green) |
| 50–79 | **Moderate** (amber) |
| 0–49 | **Low** (red) |

---

## Crop Catalog

The platform includes **11 Ghanaian crop varieties** across 5 categories:

### Cereals
| Crop | Variety | Maturation |
|---|---|---|
| White Maize | Obatanpa | 4 months |
| Sorghum | Kapaala | 4 months |
| Local Jasmine Rice | Aduanehene | 4 months |

### Legumes
| Crop | Variety | Maturation |
|---|---|---|
| Groundnut | Chinese Variety | 4 months |
| Cowpea | Songotra | 3 months |

### Tubers
| Crop | Variety | Maturation |
|---|---|---|
| Cassava | Bankye | 10 months |
| Yam | Pona | 8 months |

### Vegetables
| Crop | Variety | Maturation |
|---|---|---|
| Tomato | Pectomech | 3 months |
| Chili Pepper | Legon 18 | 4 months |

### Cash Crops
| Crop | Variety | Maturation |
|---|---|---|
| Cocoa | Amelonado | 12 months |
| Raw Cashew | — | 12 months |

---

## Example Output

**Region:** Ashanti (Forest Loam, pH 6.5, Bimodal Rainfall)  
**Month:** June

| Crop | Score | Suitability |
|---|---|---|
| White Maize | 91 | High |
| Cocoa | 88 | High |
| Cassava | 80 | High |
| Groundnut | 65 | Moderate |
| Sorghum | 48 | Low |

---

## Related API

`GET /api/recommendations/crop?region=ashanti&month=6`

See [API Reference](../api-reference.md) for full details.
