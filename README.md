# UseMe — Ride-Hailing Platform

A **status-based** ride-hailing platform. Real-time is limited to booking lifecycle
events over Socket.IO. There are **no embedded maps, no live driver-location
streaming, no polylines, and no continuous-ETA**. Driver navigation opens the
installed Google Maps app. The driver's location is only ever captured as a
one-shot GPS snapshot, used server-side to filter the ride-requests feed by radius.

## Monorepo layout (npm workspaces)

| Package | Stack | Purpose |
|---------|-------|---------|
| `shared` | TypeScript | Shared enums, socket event names, types, theme tokens, helpers |
| `backend` | Express + Socket.IO + Mongoose (TS) | REST API + real-time server |
| `admin-web` | React + Vite (TS) | Driver approvals, subscription/fare control |
| `customer-app` | Expo React Native | Customer booking app |
| `driver-app` | Expo React Native | Driver app (approval + subscription gated) |

## Getting started

```bash
npm install            # installs all workspaces (auto-builds `shared` via its prepare script)

# If you edit anything in `shared/`, rebuild it so other packages pick it up:
npm run build --workspace shared

# Backend (needs a running MongoDB + a .env, see backend/.env.example)
cp backend/.env.example backend/.env
npm run seed --workspace backend   # creates admin@useme.app / admin123, fares, plans
npm run backend

# Admin website
npm run admin

# Customer app (Expo)
npm run customer

# Driver app (Expo)
npm run driver
```

## Required external credentials (placeholders in env files)

- **MongoDB** connection string
- **Razorpay** key id + secret (driver subscriptions)
- **AWS S3** bucket + keys (driver document uploads)
- **OTP** is stubbed (dev-fixed code `123456`) — swap in a real SMS provider later.

## Feature scope

See the per-app `src/modules` folders. Every requested feature has a wired-up
skeleton module ready to be fleshed out.
