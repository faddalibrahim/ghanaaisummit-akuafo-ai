# Platform Overview

## What is Akuafo AI?

**Akuafo AI** (Akuafo means "Farmer" in Twi) is a Ghanaian Agricultural Intelligence platform designed to bridge the gap between scientific agronomic knowledge and the practical realities facing smallholder farmers across Ghana.

The platform provides data-driven crop advisory at no cost, offering:
- **Crop suitability scoring** based on real soil chemistry and rainfall forecasts
- **Optimal planting windows** calibrated to each agro-ecological zone
- **Harvest timing guidance** to minimize crop rot and field losses
- **Offline USSD access** via `*902#` for farmers without smartphones or internet

---

## Who Is It For?

| User | Use Case |
|---|---|
| **Smallholder Farmers** | Get crop recommendations and planting advice tailored to their region |
| **Extension Officers (MoFA)** | Cross-reference multiple regions quickly during field consultations |
| **Agritech Developers** | Integrate agronomic intelligence into mobile apps via the REST API |
| **NGOs & Research Bodies** | Access raw zonal data for food security analysis and planning |

---

## Architecture

```
akuafo-ai/
├── app/
│   ├── components/
│   │   └── Dashboard.tsx       # Main UI controller
│   ├── lib/
│   │   └── data.ts             # Agronomic database + intelligence engine
│   └── api/
│       ├── recommendations/
│       │   ├── crop/           # GET /api/recommendations/crop
│       │   ├── planting/       # GET /api/recommendations/planting
│       │   └── harvest/        # GET /api/recommendations/harvest
│       └── ussd/               # GET + POST /api/ussd
├── components/
│   ├── GhanaMap.tsx            # Interactive 16-region SVG map
│   └── ghana-regions.ts        # Region coordinate + metadata dataset
└── docs/                       # This documentation
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Map | Custom SVG (parsed from official Ghana GIS data) |
| Intelligence | Rule-based agronomic scoring engine (TypeScript) |
| API | Next.js Route Handlers (REST) |
| USSD | Stateful session handler (Africa's Talking compatible) |

---

## Design Principles

1. **Local First** — All data is grounded in Ghana-specific soil chemistry, regional rainfall patterns, and Ghanaian crop varieties (e.g. Obatanpa Maize, Pona Yam, Aduanehene Rice).
2. **Offline Resilient** — Core recommendations are accessible via USSD dialcodes, requiring no internet connectivity.
3. **Extensible** — The agronomic engine in `data.ts` uses a pluggable rules architecture, making it easy to add new regions, crops, and scoring factors.
4. **API-First** — Every intelligence function is exposed as a REST endpoint, enabling integration into third-party tools.
