# Akuafo AI — Documentation

> **Akuafo AI** is a Ghanaian Agricultural Intelligence & Last-Mile Advisory Platform. It empowers smallholder farmers and extension workers with AI-assisted crop suitability analysis, planting calendars, harvest timing, and offline USSD access — all grounded in real agro-zone soil data across Ghana's 16 administrative regions.

---

## Table of Contents

### 📋 Submission Docs

| Document | Description |
|---|---|
| [Problem Statement](./submission/problem-statement.md) | The challenge, objectives, and scalability vision |
| [AI/ML Approach & Work Plan](./submission/ai-ml-approach.md) | Models, techniques, data sources, and phased delivery plan |
| [Ethics & Data Protection](./submission/ethics-data-protection.md) | Privacy, consent, security, and Ghana Data Protection Act compliance |

### 🏗 Platform Docs

| Document | Description |
|---|---|
| [Overview](./platform/overview.md) | Platform introduction, architecture, and goals |
| [Data Model](./platform/data-model.md) | Regions, crops, soil profiles, and risk alerts |
| [API Reference](./platform/api-reference.md) | REST endpoint documentation |

### ✨ Feature Docs

| Document | Description |
|---|---|
| [Crop Suitability](./features/crop-suitability.md) | How the AI Matcher scores and recommends crops |
| [Planting Calendar](./features/planting-calendar.md) | Optimal planting window computation |
| [Harvest Planner](./features/harvest-planner.md) | Harvest window optimization and rot risk |
| [USSD Access](./features/ussd.md) | Offline menu system via \*902# |

---

## Quick Start

The platform runs as a Next.js web application:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Production build
pnpm build
```

Visit `http://localhost:3000` to open the dashboard.

---

## Region Coverage

Akuafo AI covers all **16 administrative regions** of Ghana, mapped to 4 underlying agro-ecological zones:

| Agro Zone         | Regions Covered                                        | Soil Type   | Rainfall      |
| ----------------- | ------------------------------------------------------ | ----------- | ------------- |
| **Northern**      | Northern, North East, Savannah, Upper West, Upper East | Sandy Loam  | Unimodal      |
| **Ashanti**       | Ashanti, Ahafo, Bono, Bono East                        | Forest Loam | Bimodal       |
| **Volta**         | Oti, Eastern, Volta                                    | Clay Loam   | Bimodal       |
| **Greater Accra** | Greater Accra, Central, Western, Western North         | Heavy Clay  | Bimodal (low) |
