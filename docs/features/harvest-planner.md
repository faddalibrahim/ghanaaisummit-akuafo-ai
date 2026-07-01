# Feature: Harvest Window Optimizer

## What It Does

The **Harvest Window Optimizer** helps farmers decide the safest and most optimal time to harvest a specific crop after it has been planted. It predicts physiological maturity date, identifies a **2-week harvest window**, flags **rotting risk**, and estimates the number of **dry days** available for field harvesting.

The goal is to minimize post-harvest losses caused by untimely rainfall during the harvest window — a major source of crop damage in Ghana.

---

## How to Use It

1. Select a **Region** on the map.
2. Open the **Harvest** tab.
3. Choose the **Harvest Crop** (e.g. Yam, Cassava, Sorghum).
4. Select the **Planted Month** — the month when the crop was sown.
5. Read the output cards:
   - **Rotting Risk** — Low / Medium / High
   - **Dry Days** — number of suitable dry days within the harvest window
   - **Yield Forecast** — qualitative assessment
   - **Harvest Window** — start and end dates
   - **Advisory Text** — plain-language guidance on what to do

---

## How It Works

The logic is computed by `getHarvestAdvisory()` in `data.ts`:

### Step 1 — Physiological Maturity Date

```
Maturity Date = Planting Date + Crop Maturation Months
```

Each crop has a defined `maturationMonths` value (e.g. Maize = 4, Cassava = 10, Cocoa = 12).

### Step 2 — Harvest Window

The system defines a **14-day window** starting at the maturity date:

```
Harvest Window = [Maturity Date, Maturity Date + 14 days]
```

### Step 3 — Rainfall & Rot Risk Assessment

The region's **monthly rainfall at the maturity month** determines the harvest conditions:

| Monthly Rainfall | Dry Days | Forecasted Rain | Rot Risk | Advisory |
|---|---|---|---|---|
| < 40 mm | 12 days | 10 mm | **Low** | PERFECT — Complete dry-down ensured, low aflatoxin risk |
| 40–100 mm | 8 days | 35 mm | **Medium** | MODERATE — Plan around dry days, dry under cover |
| > 100 mm | 3 days | 90 mm | **High** | HIGH RISK — Field spoilage likely, consider mechanical drying |

---

## Crop Maturation Reference

| Crop | Maturation Period |
|---|---|
| Cowpea | 3 months |
| Maize | 4 months |
| Sorghum | 4 months |
| Rice | 4 months |
| Groundnut | 4 months |
| Tomato | 3 months |
| Pepper | 4 months |
| Yam | 8 months |
| Cassava | 10 months |
| Cocoa | 12 months |
| Cashew | 12 months |

---

## Example Scenario

**Region:** Northern  
**Crop:** Sorghum (Kapaala)  
**Planted:** June 2026  
**Maturity Date:** October 2026  
**Northern Region October Rainfall:** ~90 mm

**Result:**
- Rot Risk: **Medium**
- Dry Days: 8
- Forecasted Rain: 35 mm
- Advisory: *Plan harvesting around dry days. Dry crops under covered sheds.*

---

## Post-Harvest Tips

Based on the rot risk level, the platform implicitly guides farmers toward the right actions:

- **Low Risk** → Harvest immediately, store in ventilated traditional cribs or silos
- **Medium Risk** → Stagger harvesting over 2 weeks, sun-dry on raised platforms
- **High Risk** → Prioritize mechanical dryers (CSIR Solar Tent Dryers available in some districts), liaise with aggregators for emergency off-take

---

## Related API

`GET /api/recommendations/harvest?region=northern&crop=sorghum&planted=2026-06-01`

See [API Reference](../api-reference.md) for full details.
