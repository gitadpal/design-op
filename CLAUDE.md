# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # Start Vite dev server
npm run build  # Production build to dist/
```

No test runner or linter is configured.

## Architecture

AdPal Operation Console — an internal operations dashboard for an E-ink phone case advertising network. React 18 + TypeScript SPA built with Vite, React Router v6, Tailwind CSS v4, Recharts, and shadcn/ui components.

**Path alias:** `@` maps to `src/`.

### Routing

Defined in `src/app/routes.ts`. `AppLayout` wraps all authenticated routes with a sidebar + outlet pattern.

- `/login` — public, wallet (Privy) or demo sign-in
- `/` — Overview (cast delivery stats, campaign growth, token distribution)
- `/devices` — Device fleet table, `/devices/:id` for detail, `/devices/register` for new
- `/clients` — iOS app version metrics by device model
- `/casts` — Campaign-focused cast delivery log with filters (cast states: started/ended/claimed/aborted)
- `/reviews` — Campaign review queue for advertiser submissions (approve/reject with comment)
- `/campaigns` — Campaign health monitoring, `/campaigns/:id` for detail

### Authentication

Privy.io handles wallet-based login. App ID is set as a constant in `src/app/App.tsx`. `AuthContext` (`src/app/context/auth-context.tsx`) wraps Privy state and exposes `user`, `login`, `logout`. Falls back to mock auth with localStorage if Privy is unavailable. Demo login creates a preset operator account.

### Data

All data is mocked in `src/app/utils/mock-data.ts` — there is no backend API. Key models: `Device`, `CampaignMonitor`, `CastEvent`, `AppClient`, `DeviceInteraction`, `Advertiser`. Time-series data for campaign growth and token distribution (USDC-denominated) lives here too.

**Key data models** (in `mock-data.ts`):
- `CampaignMonitor` — status: `review | approved | active | completed | aborted`, includes `advertiserId`, `startDate`, review fields
- `CastEvent` — status: `started | ended | claimed | aborted`
- `Advertiser` — id, name, company, email; linked to campaigns via `advertiserId`
- `Device` — identified by `chipId` (not device_id), keys are `devicePk` and `boundAppPk` (not public_key)
- `DeviceInteraction` — references devices via `chipId`

### Metric definitions

- **Fill rate** = Active Devices on Campaign / Eligible Devices in Network (supply-side, not advertiser-target-based)
- **Pacing** = Actual Tokens Distributed / Expected Tokens Distributed (where Expected = Total Pool × Elapsed Days / Duration Days)
- **Pool consumed** = Tokens Distributed / Total Token Pool

### Styling

Tailwind CSS v4 via Vite plugin (no `tailwind.config.js`). CSS entry point is `src/styles/tailwind.css`. Theme tokens defined in `src/styles/theme.css`. Font imports in `src/styles/fonts.css`. Uses `Space Grotesk` for display numbers/headings.

Shared UI primitives are Radix-based shadcn/ui components in `src/app/components/ui/`. App-level shared components (`MetricCard`, `SectionHeader`, `AppSidebar`) live in `src/app/components/`.

### Design conventions

- Status colors: teal `#177e73` (healthy/success), orange `#b8672f` (warning), red `#c44c3f` (failed/critical), purple `#7c3aed` (special/cumulative)
- Cards use `glass-effect border-0` class pattern
- Status badges: rounded-lg with colored bg/text/border
- KPI summary cards: rounded-2xl with tinted backgrounds
- Tabular numbers: `tabular-nums` + `font-['Space_Grotesk']` for metric values
- Tables are clickable rows that navigate to detail pages
