# TMS Predictive Maintenance Dashboard

A Next.js 14 dashboard for real-time visualization of Thermal Management System (TMS) predictive maintenance predictions stored in MongoDB.

## Stack
- **Next.js 14** (App Router) with TypeScript
- **MongoDB** via official Node.js driver
- **Recharts** for trend charts
- **Tailwind CSS** for styling
- **Space Grotesk** font for industrial-technical aesthetic

## Features
- 📊 **Overview Tab** — Risk gauges, anomaly scores, threshold comparison, recommendations
- 📈 **Trend History Tab** — Area chart of failure probabilities over time + run log table
- 🔍 **Drift Report Tab** — Data drift status and feature metrics
- 🔄 **Auto-refresh** every 30 seconds
- 🚨 **Live alert banner** when systems are triggered

## Project Structure
```
tms-dashboard/
├── app/
│   ├── api/
│   │   └── predictions/
│   │       ├── route.ts          # GET /api/predictions (latest)
│   │       └── history/
│   │           └── route.ts      # GET /api/predictions/history?limit=N
│   ├── page.tsx                  # Main dashboard page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── RiskGauge.tsx             # SVG arc gauge with pulse ring
│   ├── AnomalyBar.tsx            # Horizontal bar for anomaly scores
│   ├── RecommendationCard.tsx    # Recommendation with alert state
│   ├── HistoryChart.tsx          # Recharts area chart
│   └── StatCard.tsx              # Metric stat card
├── lib/
│   ├── mongodb.ts                # MongoDB client singleton
│   └── types.ts                  # TypeScript interfaces
└── package.json
```

## Setup & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## MongoDB Config
- **Connection**: set via `MONGODB_URI` in `.env.local` (see `.env.example`)
- **Database**: `transACNR`
- **Collection**: `predictions`

The dashboard fetches the **latest** prediction document sorted by `inference_timestamp` and the last **20 runs** for historical trending.
