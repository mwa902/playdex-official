# Playdex — Lahore Sports Venue & Booking Platform

A full-stack web platform for discovering sports arenas, gyms, and swimming pools across Lahore.
Users browse 135+ venues, view available time slots, and book with a cash-on-arrival e-slip.
Admins manage venues and create booking slots through a dedicated admin panel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Backend  | NestJS, TypeScript |
| Database | PostgreSQL 16 |
| Styling  | Custom CSS design tokens (light + dark mode) |
| Auth     | localStorage session, bcrypt password hashing |

---

## Admin Account Setup

Set a unique `SUPERADMIN_PASSWORD` in the server environment before first startup. The server seeds the initial superadmin only when the users table is empty. Do not commit the password or publish demo credentials. Regular users can register through `/login`.

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally
- Two terminal windows

### 1. Clone and install

```bash
git clone https://github.com/your-org/playdex-official.git
cd playdex-official

# Install backend deps
cd server && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Environment setup

**Backend** — create `server/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB
FRONTEND_URL=http://localhost:3000
AUTH_TOKEN=Bearer-my-secret-token
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=replace-with-a-unique-password
SUPERADMIN_NAME=Super Admin
```

**Frontend** — create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 3. Run both servers

**Terminal 1 — Backend:**
```bash
cd server
npm run start:dev
```
Runs on **http://localhost:5000**
Swagger docs at **http://localhost:5000/docs**

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Runs on **http://localhost:3000**

---

## Key URLs

| URL | Description |
|-----|-------------|
| `localhost:3000` | Landing page |
| `localhost:3000/arenas` | Public venue finder (135 Lahore venues) |
| `localhost:3000/arenas/:id` | Venue detail — slots with timing, price, book |
| `localhost:3000/admin/login` | Admin login |
| `localhost:3000/admin/arenas` | Admin panel — manage venues & add slots |
| `localhost:3000/login` | User login |
| `localhost:3000/dashboard` | Operations dashboard (admin) |
| `localhost:5000/docs` | Swagger API docs |

---

## Features

### Public Site
- Browse 135 sports arenas, gyms, and pools across Lahore
- Search by name, area, or description
- Filter by type: Arena / Gym / Pool
- Google Maps embed + direct map links
- Venue detail page with address, phone (tap-to-call), capacity
- Slot boxes showing: date, time range, seats, price (PKR), cash-on-arrival badge
- Book a slot (requires login)
- E-slip generation with print support after booking

### Admin Panel
- Separate login at `/admin/login`
- Stats overview: total venues, slots, active slots
- Search and filter all 135 venues
- Expand any venue to see its current slots
- Add slots: name, sport type, start/end time, capacity, price, availability
- Delete slots

### Operations Dashboard (`/dashboard`)
- Full CRUD for Events, Venues, Bookings, Organizations
- User management (superadmin only)
- Dark/light mode toggle

---

## Database Migrations

Migrations run automatically on server startup. Files are in `server/src/database/migrations/`:

| File | Description |
|------|-------------|
| `01_create_users.sql` | Users table |
| `02_create_organization.sql` | Organizations |
| `03_create_venue.sql` | Venues |
| `04_create_event_type.sql` | Sport type categories |
| `05_create_events.sql` | Events (slots) |
| `06_create_booking.sql` | Bookings |
| `07_indexes.sql` | Performance indexes |
| `08_venue_sport_type_phone.sql` | Adds sport_type, phone, google_maps_url to venues |
| `09_seed_lahore_venues.sql` | Seeds all 135 Lahore venues |
| `10_venue_schema_fix.sql` | Removes duplicate address constraint |
| `11_event_price.sql` | Adds price column to events |

## Production Database

The API requires a persistent PostgreSQL database in production. A free-tier Neon PostgreSQL database works with the existing `pg` driver. Create a Neon project, copy its pooled or direct connection string, then set it as `DATABASE_URL` in the API host's environment. Keep the value private; do not put it in `NEXT_PUBLIC_*` variables or commit it to the repository.

For deployment, set `DATABASE_URL` on the API service and `BACKEND_INTERNAL_URL` on the Vercel project to the public base URL of that API. Vercel proxies `/api/*` to this address. The stale Railway URL previously checked into `vercel.json` has been removed. Production builds now fail if the backend URL is not configured.

On startup, the API applies pending migrations. Migration `09_seed_lahore_venues.sql` seeds the 135 Lahore venues, and later migrations seed event types and add booking payment fields. The smaller connection pool is configured for hosted database limits. Deploys reuse the same database as long as `DATABASE_URL` stays pointed at that database; do not reset or replace the database to deploy code changes.

If `DATABASE_URL` is missing or a migration fails, the production API now fails startup instead of appearing healthy with unusable data endpoints. Verify deployment by checking `GET /` and `GET /venues` on the API. Free database tiers have storage, compute, and inactivity limits; API hosting may also have separate costs.

---

## Project Structure

```
playdex-official/
├── server/                   NestJS backend
│   └── src/
│       ├── booking/          Booking CRUD
│       ├── database/         DB service + migrations
│       ├── event/            Event/slot CRUD
│       ├── event-type/       Sport categories
│       ├── organization/     Organization CRUD
│       ├── user/             Auth + user management
│       └── venue/            Venue CRUD
│
├── frontend/                 Next.js frontend
│   ├── app/
│   │   ├── (auth)/login      User login page
│   │   ├── (dashboard)/      Admin dashboard routes
│   │   ├── (marketing)/      Public pages (home, arenas)
│   │   └── admin/            Admin panel (login + arena management)
│   ├── components/
│   │   ├── admin/            AdminLoginPage, ArenaManagePage
│   │   ├── dashboard/        Dashboard CRUD pages
│   │   ├── marketing/        LandingPage, ArenasPage, ArenaDetailPage
│   │   └── ui/               Modal, StatusBadge, StateView, Toast
│   ├── context/              AuthContext, ThemeContext
│   ├── hooks/                useData, useToast
│   ├── lib/                  api-client.ts
│   └── styles/               tokens.css, components.css, marketing.css
│
├── docker-compose.yml        Postgres + migrations (local)
└── vercel.json               Vercel deployment config
```

---

## Deployment

### Frontend — Vercel

Follow [the frontend Vercel deployment guide](frontend/VERCEL_DEPLOYMENT.md). Set the project root to `frontend` and configure `BACKEND_INTERNAL_URL` with the deployed API's HTTPS origin.

### Backend — Render

Use the repository's `render.yaml` Blueprint, which sets the service root to `server` and runs only the NestJS build. Set `DATABASE_URL`, `SUPERADMIN_PASSWORD`, and `FRONTEND_URL` in Render's environment settings. Keep secrets in the host's environment panel, never in the repository.

---

## API Endpoints (summary)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/users/login` | Login |
| GET | `/venues` | List all venues |
| GET | `/events` | List all slots |
| POST | `/events` | Create slot (admin) |
| DELETE | `/events/:id` | Delete slot (admin) |
| POST | `/bookings` | Create booking |
| GET | `/bookings/event/:id` | Bookings for a slot |

Full docs at `http://localhost:5000/docs`
