# No Mercy Racing League

A full-stack tournament manager for the No Mercy Racing League esports community.

## Overview

This repository contains:

- `client/` — React + Vite frontend with Tailwind CSS
- `server/` — Node.js + Express backend with MongoDB and Mongoose
- JWT-based admin authentication and secure admin-only operations

The app supports public team registration, leaderboard display, fixture generation, and hidden admin event management flows.

## Key Features

- Public registration for teams with exactly 5 drivers (4 Main + 1 Reserve)
- Duplicate alias prevention and driver eligibility tracking
- Hidden admin control route: `/admin-control-x9k2`
- Public pages for Home, Register, Leaderboards, Fixtures, and Rules
- Admin pages for approvals, fixture generation, results entry, penalties, and POV links
- Automatic seasonal round-robin fixture generation for Team GP, Duo Clash, and Solo Showdown
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
  - `src/middleware/auth.js` — JWT authentication middleware

## Requirements

- Node.js 18+ or compatible
- MongoDB running locally or accessible remotely

## Setup

1. Install frontend and backend dependencies from the repository root:

```bash
npm run install:all
```

2. Create the server environment file:

```bash
copy server\.env.example server\.env
```

3. Update `server/.env` with your values, including:

- `MONGO_URI`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

4. Seed the admin user:

```bash
npm run seed:admin --prefix server
```

5. Start the development servers:

```bash
npm run dev
```

## Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Hidden admin route: `http://localhost:5173/admin-control-x9k2`

## Available Scripts

From the repository root:

- `npm run install:all` — install dependencies for both frontend and backend
- `npm run dev` — run frontend and backend concurrently
- `npm run build` — build the frontend for production
- `npm start` — start the backend server only

Frontend (`client/`):

- `npm run dev` — start Vite development server
- `npm run build` — build production assets
- `npm run preview` — preview the built frontend

Backend (`server/`):

- `npm run dev` — start backend with nodemon
- `npm start` — run backend in production mode
- `npm run seed:admin` — seed admin user from `server/.env`

## Notes

- Change the default admin credentials before deploying to production.
- Confirm MongoDB is accessible through `MONGO_URI`.
- To deploy, build the frontend with `npm run build --prefix client` and serve the production assets with a suitable web server.
