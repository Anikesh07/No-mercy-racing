# No Mercy Racing League

A full-stack tournament manager for the No Mercy Racing League esports community.

## Overview

This repository contains:

- `client/` — React + Vite frontend with Tailwind CSS
- `server/` — Node.js + Express backend with MongoDB and Mongoose
- Shared admin flow using JWT authentication for secure admin operations

The app supports public team registration, leaderboard display, fixture generation, and admin-only event management.

## Features

- Public registration for teams with exactly 5 drivers (4 Main + 1 Reserve)
- Duplicate alias prevention and eligibility tracking
- Hidden admin control route: `/admin-control-x9k2`
- Public pages for Home, Register, Leaderboards, Fixtures, and Rules
- Admin workflows for approvals, fixture generation, results entry, penalties, and POV links
- Automated seasonal round-robin generation for Team GP, Duo Clash, and Solo Showdown
- Separate team leaderboard and driver rating leaderboard
- Eligibility statuses: Eligible, Restricted, Assigned

## Project Structure

- `client/` — frontend source
  - `src/` — React pages and components
  - `public/` — static assets
- `server/` — backend source
  - `src/routes/` — API endpoints
  - `src/models/` — Mongoose schemas
  - `src/services/` — scoring and fixture logic
  - `src/middleware/auth.js` — JWT auth handling

## Requirements

- Node.js 18+ (or compatible)
- MongoDB running locally or accessible remotely

## Setup

1. Install all dependencies from the repository root:

```bash
npm run install:all
```

2. Create the server environment file:

```bash
copy server\.env.example server\.env
```

3. Configure your `server/.env` values, especially:

- `MONGO_URI`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

4. Seed the admin user:

```bash
npm run seed:admin --prefix server
```

5. Start both frontend and backend concurrently:

```bash
npm run dev
```

## Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Admin route: `http://localhost:5173/admin-control-x9k2`

## Available Scripts

From the repository root:

- `npm run install:all` — install dependencies for both frontend and backend
- `npm run dev` — start client and server in development mode
- `npm run build` — build the frontend for production
- `npm start` — start the backend server only

Frontend (`client/`):

- `npm run dev` — start Vite dev server
- `npm run build` — build production assets
- `npm run preview` — preview built frontend

Backend (`server/`):

- `npm run dev` — start backend with nodemon
- `npm start` — run backend in production mode
- `npm run seed:admin` — create the admin user from environment credentials

## Notes

- Update the default admin credentials in `server/.env` before using the app in production.
- Ensure `MONGO_URI` is valid and MongoDB is running.
- If you want to deploy the app, build the frontend with `npm run build --prefix client` and serve the built assets with a production server.
