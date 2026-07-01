# API Reference

**Base URL:** `https://api.akuafo.ai/api`

**Authentication:** `X-API-Key: <your-key>` header *(not required in prototype mode)*

**Response format:** `application/json`

---

## Endpoints

### 1. GET /api/recommendations/crop

Returns a ranked list of crop recommendations for a given agro-zone and planting month.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `region` | string | ✓ | Zone ID: `northern`, `ashanti`, `volta`, `greater-accra` |
| `month` | integer | ✓ | Target planting month (1 = Jan, 12 = Dec) |

**Example Request**

```
GET /api/recommendations/crop?region=northern&month=6
```

**Example Response**

```json
[
  {
    "crop": {
      "id": "sorghum",
      "name": "Sorghum (Kapaala)",
      "category": "Cereal",
      "marketPriceGhS": 520,
      "priceUnit": "100kg Bag",
      "marketDemand": "Medium"
    },
    "score": 88,
    "suitability": "High",
    "reasons": [
      "Optimal planting window: Month 6 falls within recommended sowing months.",
      "Soil texture match: Sandy Loam is highly compatible with root development."
    ],
    "warnings": []
  },
  {
    "crop": { "id": "maize", "name": "White Maize (Obatanpa)", ... },
    "score": 72,
    "suitability": "Moderate",
    "reasons": [...],
    "warnings": ["Slightly acidic soil (6.2) may limit phosphate availability."]
  }
]
```

---

### 2. GET /api/recommendations/planting

Returns the optimal planting window for a specific crop and region.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `region` | string | ✓ | Zone ID |
| `crop` | string | ✓ | Crop slug (e.g. `maize`, `cocoa`, `rice`) |
| `date` | string | ✓ | ISO date string (e.g. `2026-06-15`) |

**Example Request**

```
GET /api/recommendations/planting?region=ashanti&crop=maize&date=2026-06-15
```

**Example Response**

```json
{
  "soilMoistureStatus": "Adequate",
  "soilMoistureScore": 59,
  "optimalWindowStart": "5 Jun",
  "optimalWindowEnd": "20 Jun",
  "weeklyRainfallForecast": [49, 66, 44, 60],
  "readinessIndex": 90,
  "advisoryText": "EXCELLENT window. Soil moisture is adequate (59%) and rain forecasts suggest steady seed germination support. Sow now."
}
```

---

### 3. GET /api/recommendations/harvest

Predicts the optimal harvest window and rot risk for a crop given its planting date.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `region` | string | ✓ | Zone ID |
| `crop` | string | ✓ | Crop slug (e.g. `yam`, `cassava`, `sorghum`) |
| `planted` | string | ✓ | ISO date the crop was planted (e.g. `2026-03-01`) |

**Example Request**

```
GET /api/recommendations/harvest?region=northern&crop=sorghum&planted=2026-06-01
```

**Example Response**

```json
{
  "physiologicalMaturityDate": "1 Oct 2026",
  "harvestWindowStart": "1 Oct 2026",
  "harvestWindowEnd": "15 Oct 2026",
  "rotRisk": "Medium",
  "forecastedRainDuringWindow": 35,
  "daysOfDrySpell": 8,
  "advisoryText": "MODERATE risk. Expect occasional showers (35mm). Plan harvesting around dry days (approx 8 sunny days). Dry crops under cover."
}
```

---

### 4. GET/POST /api/ussd

USSD gateway handler for offline, menu-driven access to agronomic data. Compatible with Africa's Talking and Hubtel USSD platforms.

#### GET — Health Check

```
GET /api/ussd
```

Returns `200 OK` with a status message confirming the gateway is live.

#### POST — Session Handler

**Request Body (JSON or form-encoded)**

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | string | ✓ | Unique session identifier provided by the USSD gateway |
| `phoneNumber` | string | ✓ | Caller's MSISDN (e.g. `+233244000000`) |
| `text` | string | ✓ | Accumulated user input, `*`-delimited (e.g. `1*2*3`) |

**Example Request**

```json
POST /api/ussd
Content-Type: application/json

{
  "sessionId": "ATUid_abc123",
  "phoneNumber": "+233244000000",
  "text": "1"
}
```

**Example Response**

```
CON Akuafo AI - Northern Region
Select service:
1. Crop Recommendations
2. Planting Windows
3. Harvest Advisor
4. Regional Risk Alerts
```

**Text Input Format**

| Input Sequence | Meaning |
|---|---|
| (empty / `*902#`) | New session — select region |
| `1` | Region = Northern |
| `2` | Region = Ashanti |
| `3` | Region = Greater Accra |
| `4` | Region = Volta |
| `1*1` | Northern → Crop Recommendations |
| `1*1*6` | Northern → Crop Recommendations → Month 6 |
| `2*2` | Ashanti → Planting Windows |
| `2*2*1` | Ashanti → Planting Windows → Crop = Maize |
| `1*4` | Northern → Risk Alerts |

---

## Error Responses

| HTTP Code | Meaning |
|---|---|
| `400` | Missing or invalid query parameters |
| `404` | Region or crop ID not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

Error response body:
```json
{
  "error": "Invalid region: 'xyz'. Valid options: northern, ashanti, volta, greater-accra."
}
```

---

## Rate Limits

| Tier | Limit |
|---|---|
| Prototype | 100 requests/minute per IP |
| Production | 10,000 requests/minute with regional edge caching |

---

## Crop Slugs Reference

| Slug | Crop Name |
|---|---|
| `maize` | White Maize (Obatanpa) |
| `sorghum` | Sorghum (Kapaala) |
| `cassava` | Cassava (Bankye) |
| `yam` | Yam (Pona) |
| `cocoa` | Cocoa (Amelonado) |
| `rice` | Local Jasmine Rice (Aduanehene) |
| `groundnut` | Groundnut (Chinese Variety) |
| `cowpea` | Cowpea (Songotra) |
| `tomato` | Tomato (Pectomech) |
| `pepper` | Chili Pepper (Legon 18) |
| `cashew` | Raw Cashew Nut |
