# Trading Config React Frontend

This is the React (Vite) frontend for the trading config dashboard.

## Run in development

1. Start backend API/static server from repo root:
   - `npm run config:ui`
2. In another terminal, start React dev server:
   - `npm run config:frontend:dev`
3. Open [http://127.0.0.1:5173](http://127.0.0.1:5173)

The dev server proxies `/api/*` requests to `http://127.0.0.1:3030`.

## Build

From repo root:
- `npm run config:frontend:build`

After building, `tradingConfigServer.js` will automatically serve files from `frontend-react/dist`.
