# Feature: USSD Offline Access

## What It Does

The **USSD Offline Access** system allows farmers without smartphones or internet access to query Akuafo AI's agronomic recommendations directly from any basic mobile phone by dialling **`*902#`**.

USSD (Unstructured Supplementary Service Data) works on all GSM networks with no data connection required — making it ideal for rural Ghana where smartphone penetration and reliable internet remain limited.

---

## How to Access It

1. Dial **`*902#`** from any mobile phone on a supported network.
2. Select your **Region** (Northern, Ashanti, Greater Accra, Volta).
3. Choose a **Service** from the menu:
   - Crop Recommendations
   - Planting Windows
   - Harvest Advisor
   - Regional Risk Alerts
4. Follow the on-screen prompts to get personalised advisory.

> No smartphone needed. No internet needed. Works on all networks.

---

## USSD Session Flow

```
Dial *902#
    │
    ▼
Welcome — Select Region
1. Northern
2. Ashanti
3. Greater Accra
4. Volta
    │
    ▼
Select Service
1. Crop Recommendations
2. Planting Windows
3. Harvest Advisor
4. Regional Risk Alerts
    │
    ├── Crop Recommendations
    │       → Select Month (1–12)
    │       → Top 3 crops displayed with suitability level
    │
    ├── Planting Windows
    │       → Select Crop
    │       → Advisory text + optimal window dates
    │
    ├── Harvest Advisor
    │       → Select Crop
    │       → Enter Planted Month
    │       → Harvest window + rot risk + dry days
    │
    └── Regional Risk Alerts
            → Active risk alerts for selected region
            → Affected crops + mitigation steps
```

---

## Supported Networks

The USSD gateway is designed to integrate with:

| Platform | Status |
|---|---|
| **Africa's Talking** | Supported (primary integration) |
| **Hubtel** | Supported |
| MTN Ghana | Compatible via Africa's Talking |
| Vodafone Ghana | Compatible |
| AirtelTigo | Compatible |

---

## Response Format

USSD responses follow the standard format used by Africa's Talking and similar platforms:

- **`CON`** — Continues the session (more menu items to show)
- **`END`** — Terminates the session (final answer delivered)

Example:
```
CON Welcome to Akuafo AI Advisor.
Select your region:
1. Northern
2. Ashanti
3. Greater Accra
4. Volta
```

```
END Top crops for Northern (Month 6):
1. Sorghum - High (88%)
2. Maize - Moderate (72%)
3. Cowpea - Moderate (65%)
Dial *902# to restart.
```

---

## Session State Machine

The USSD handler (`processUSSDRequest()` in `data.ts`) is a stateful session machine that tracks each caller's session using their `sessionId`. The state transitions are:

```
welcome → menu → crop_recommender_month → crop_recommender_results
               → planting_crop → planting_results
               → harvest_crop → harvest_planted_date → harvest_results
               → risk_results
```

Sessions are stored in-memory during the session and reset when the caller dials `*902#` again or the session expires.

---

## Developer Integration

To integrate with your own USSD gateway, point your callback URL to:

```
POST https://api.akuafo.ai/api/ussd
```

**Request Body:**

```json
{
  "sessionId": "unique-session-id",
  "phoneNumber": "+233244000000",
  "text": "1*2*3"
}
```

The `text` field contains the **full input sequence** accumulated during the session (e.g. `1` → region selected, `1*2` → service selected, `1*2*3` → crop selected), separated by `*`.

**Response:**

Plain text string prefixed with `CON` (continue) or `END` (terminate).

See [API Reference](../api-reference.md) for the full endpoint spec.

---

## Why USSD Matters for Ghana

- Over **60%** of Ghana's agricultural workforce are smallholder farmers, many in peri-urban and rural areas.
- Feature phones (non-smartphones) still account for a significant share of devices in Northern and Upper East regions.
- USSD requires **zero data cost** to the farmer — charges are borne by the service operator.
- Response time is near-instant (<2 seconds) even on 2G networks.
