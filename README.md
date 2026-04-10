# AdPal Operation Console

Read-only monitoring dashboard for the AdPal E-ink phone case advertising network. Provides operators with real-time visibility into device fleets, campaign delivery, and token distribution.

## Overview

The Operation Console is an internal tool for network operators to monitor:

- **Device Fleet** — Status, firmware versions, and connectivity of E-ink phone cases
- **Cast Delivery** — Campaign-to-device delivery logs with filtering and status tracking
- **Campaign Health** — Active campaign monitoring, participation rates, and token pool usage
- **Client Apps** — iOS app version distribution across device models
- **Token Distribution** — USDC-denominated earnings and payout tracking

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite 6
- **Routing:** React Router v6
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Charts:** Recharts
- **Auth:** Privy.io (wallet-based login) with demo mode fallback

## Getting Started

```bash
npm install
npm run dev
```

### Demo Login

If no Privy App ID is configured, the app falls back to mock authentication. Use the demo login option on the sign-in page to access the dashboard with a preset operator account.

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start Vite dev server        |
| `npm run build` | Production build to `dist/`  |

## Project Structure

```
src/
├── app/
│   ├── components/     # Shared app components (MetricCard, SectionHeader, AppSidebar)
│   │   └── ui/         # shadcn/ui primitives (Button, Card, Table, etc.)
│   ├── context/        # AuthContext (Privy wrapper)
│   ├── pages/          # Route page components
│   ├── utils/          # Mock data and helpers
│   ├── App.tsx         # Root with auth provider and router
│   └── routes.ts       # Route definitions
├── styles/
│   ├── tailwind.css    # CSS entry point
│   ├── theme.css       # Design tokens
│   └── fonts.css       # Font imports (Space Grotesk)
└── main.tsx
```

## Data

All data is currently mocked in `src/app/utils/mock-data.ts` — there is no backend API. Key models include `Device`, `CampaignMonitor`, `CastEvent`, `AppClient`, and `DeviceInteraction`.

## Part of the AdPal Monorepo

This app lives in the `operation/` directory of the AdPal monorepo alongside:

- `client/` — Mobile consumer app for E-ink case users
- `platform/` — Advertiser campaign management dashboard
