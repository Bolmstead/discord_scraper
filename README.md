# Discord Scraper + Trading Config Dashboard

This repo contains:

- A Node backend for trading config APIs (`tradingConfigServer.js`)
- A React/Vite frontend dashboard (`frontend-react`)
- A Discord/Twitter tracker scraper (`scrapeTwitterTracker.js`)

## Prerequisites

- Node.js 18+ (recommended)
- npm

## Install

From repo root:

```bash
npm install
npm --prefix frontend-react install
```

## Run the Dashboard (Recommended Dev Flow)

Start backend + React dev server together:

```bash
npm run dev
```

Then open:

- Frontend: `http://127.0.0.1:5173`
- API base: `http://127.0.0.1:3030/api`

Notes:

- The React app can run alone, but it still needs the backend for `/api/*` data.
- `npm run dev` starts both services for local development.

## Run Backend and Frontend Separately

Terminal 1:

```bash
npm run config:ui
```

Terminal 2:

```bash
npm run config:frontend:dev
```

## Serve Built Frontend From Backend

Build frontend bundle:

```bash
npm run config:frontend:build
```

Start backend:

```bash
npm run start
```

Then open `http://127.0.0.1:3030`.

## Run Twitter/Discord Tracker

```bash
npm run twitter
```

This launches a non-headless browser and opens Discord login.

## Environment Variables

Create/update `.env` in repo root as needed.

Common backend variables:

- `TRADING_CONFIG_PORT` (default `3030`)
- `TRADING_CONFIG_HOST` (default `0.0.0.0`)
- `TRADING_CONFIG_AUTH` (`true` or `false`, default `false`)
- `TRADING_CONFIG_DB_PATH` (optional sqlite path)

Variables used by scraper/trading integrations include:

- `DISCORD_LOGIN_TOKEN`
- `HELIUS_RPC_URL`
- `JUPITER_API_KEY`
- `TEST_WALLET_PRIVATE_KEY`
- `SHARIF_WALLET_PRIVATE_KEY`
- Telegram/Mailgun keys used by notifier helpers

## Available npm Scripts

- `npm run dev` - backend + frontend dev server
- `npm run start` - backend only
- `npm run frontend` - frontend dev server only
- `npm run config:ui` - backend only (same target as start)
- `npm run config:frontend:dev` - frontend dev server
- `npm run config:frontend:build` - build frontend
- `npm run config:frontend:preview` - preview built frontend
- `npm run twitter` - launch Discord/Twitter tracker
- `npm run testSwap` - run swap test script
- `npm run testJupiter` - run Jupiter API test
- `npm run testJupiterClient` - run Jupiter client test
- `npm run createWallet` - helper wallet creation script

## Troubleshooting

- Port 3030 already in use:
  - Find process: `lsof -nP -iTCP:3030 -sTCP:LISTEN`
  - Stop it, or change `TRADING_CONFIG_PORT`
- Frontend shows API errors:
  - Confirm backend is running on `127.0.0.1:3030`
- Backend returns frontend build missing:
  - Run `npm run config:frontend:build`, or use React dev server at `5173`
