# Feature: Planting Calendar Optimizer

## What It Does

The **Planting Calendar Optimizer** tells farmers the best time to sow a specific crop in their chosen region. It computes a **Soil Readiness Index (0–100)** and produces a recommended planting window (start and end date) based on soil moisture, rainfall timing, and the crop's known growing season.

It also shows a **4-week rainfall forecast bar chart** to give a visual sense of water availability in the coming weeks.

---

## How to Use It

1. Select a **Region** on the map (left panel).
2. Set the **Current Month** in the header dropdown.
3. Open the **Calendar** tab.
4. Choose a **Target Crop** from the dropdown (e.g. Maize, Cocoa, Yam).
5. Read the **Soil Readiness Index**, **Moisture Status**, and the advisory text.
6. The **optimal window** is displayed as a start and end date range (e.g. "5 Jun → 20 Jun").

---

## How It Works

The advisory is computed by `getPlantingAdvisory()` in `data.ts`:

### Step 1 — Soil Moisture Score

The current month's expected rainfall for the selected region is used to compute a moisture score:

| Monthly Rainfall | Base Moisture Score |
|---|---|
| > 150 mm | 85 |
| 80–150 mm | 65 |
| 30–80 mm | 40 |
| < 30 mm | 15 |

Soil texture modifies this score:
- **Heavy Clay** — retains water → score × 1.2
- **Sandy Loam** — drains fast → score × 0.9

### Step 2 — Moisture Status Classification

| Score Range | Status |
|---|---|
| > 75 | Saturated |
| 35–75 | Adequate |
| < 35 | Low |

### Step 3 — Readiness Index & Advisory Text

The readiness index and advisory text depend on both whether the **current month is an optimal planting month** for the crop and the **soil moisture status**:

| Scenario | Readiness Index | Advisory |
|---|---|---|
| Optimal month + Adequate moisture | 90 | EXCELLENT — Sow now |
| Optimal month + Saturated soil | 65 | CAUTION — Wait 5 days for drainage |
| Optimal month + Low moisture | 40 | RISKY — Delay until heavy rains resume |
| Non-optimal month (any moisture) | 20 | UNRECOMMENDED — Off-season planting |

### Step 4 — Weekly Rainfall Forecast

The 4-week rainfall forecast is derived from the region's monthly rainfall estimate, distributed as:
- Week 1: 90% of weekly average
- Week 2: 120%
- Week 3: 80%
- Week 4: 110%

This gives a realistic wave pattern consistent with Ghana's intermittent rainfall cycles.

---

## Planting Windows by Crop & Zone

| Crop | Northern | Ashanti | Volta | Greater Accra |
|---|---|---|---|---|
| Maize | Apr, May, Jun, Sep | Apr, May, Jun, Sep | Apr, May, Jun, Sep | Apr, May, Jun, Sep |
| Sorghum | Jun, Jul | — | Jun, Jul | — |
| Cassava | Apr, May, Jun, Sep, Oct | Apr–Oct | Apr–Oct | Apr–Oct |
| Yam | Feb, Mar, Apr | Feb, Mar, Apr | Feb, Mar, Apr | — |
| Cocoa | — | May, Jun | — | — |
| Rice | Jun, Jul | Jun, Jul | Jun, Jul | Jun, Jul |
| Groundnut | Apr, May, Aug, Sep | Apr, May, Aug, Sep | Apr, May | — |
| Cowpea | May, Jun, Sep | May, Jun, Sep | May, Jun | — |
| Tomato | Mar, Apr, Oct | Mar, Apr, Oct | Mar, Apr | Mar, Apr |
| Pepper | Apr, May, Oct | Apr, May, Oct | Apr, May | — |
| Cashew | — | Jun, Jul | Jun, Jul | — |

---

## Related API

`GET /api/recommendations/planting?region=northern&crop=maize&date=2026-06-15`

See [API Reference](../api-reference.md) for full details.
