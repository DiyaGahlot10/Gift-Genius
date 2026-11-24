# GiftGenius

**Because every person deserves a thoughtful gift.**

GiftGenius is an MERN e-commerce platform that recommends gifts based on the recipient's relationship, occasion, personality, interests and the shopper's budget, using a weighted rule-based recommendation engine.

## Stack

- **Client:** React (Vite), React Router, Tailwind CSS, Axios, Framer Motion, Lucide React, React Hot Toast
- **Server:** Node.js, Express, Mongoose, JWT (httpOnly cookie), bcryptjs
- **Database:** MongoDB (local or Atlas)

## Prerequisites

- Node.js 18 or newer
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a free MongoDB Atlas cluster

## Setup

### 1. Server

```bash
cd server
cp .env.example .env      # then edit .env (set a long random JWT_SECRET)
npm install
npm run dev
```

The API runs at http://localhost:5000. Check http://localhost:5000/api/health.

### 2. Client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The app runs at http://localhost:5173. Requests to `/api` are proxied to the server.

### 3. Verify the connection

Open http://localhost:5173 for the full GiftGenius site. Run `npm run seed` in `server/` once so the catalogue has products.

## Project structure

```
giftgenius/
  client/   React app (components, pages, layouts, context, hooks, services, utils)
  server/   Express API (config, controllers, middleware, models, routes, services, seed)
```

## Build status

- [x] Phase 2: project setup
- [x] Phase 4a: models, auth, products, seed (`npm run seed` in `server/`)
- [x] Phase 4b: recommendation engine (`npm run test:recommend` in `server/`)
- [x] Phase 4c: cart, orders, wishlist (`npm run test:pricing`, `npm run test:api`, `npm run advance-order` in `server/`)
- [x] Phase 3: frontend pages (home, gift finder, results, shop, product, cart, checkout, orders, auth, wishlist)
- [ ] Phase 5/6: integration, testing, polish

## Deploying (Render + MongoDB Atlas)

One Render web service runs both the API and the built React app.

1. Push this project to a GitHub repository (never commit `.env`).
2. On https://render.com create a **New > Web Service** from that repo.
3. Settings:
   - **Root Directory:** leave empty
   - **Build Command:** `cd client && npm install --include=dev && npm run build && cd ../server && npm install`
   - **Start Command:** `cd server && npm start`
4. **Environment variables:** `NODE_ENV=production`, `MONGO_URI` (your Atlas string), `JWT_SECRET` (long random), `JWT_EXPIRES_IN=7d`, `CLIENT_URL` (your Render URL, e.g. `https://giftgenius.onrender.com`).
5. In Atlas, **Network Access** must allow `0.0.0.0/0`.
6. Seed the database once from your own computer (it uses the same Atlas database): `cd server && npm run seed`.
7. Open `<your-url>/api/health`, then the site. On the free plan the first request after idle takes about a minute.
