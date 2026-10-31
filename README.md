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

## Login Credentials

### Admin Panel — `/admin/login`

| Name | Email | Password | Role |
|------|-------|----------|------|
| Super Admin | `superadmin@playdex.io` | `SuperAdmin@2024` | superadmin |
| Platform Admin | `admin@playdex.io` | `Admin@2024` | admin |
| Wahad Ahmed | `wahad@playdex.io` | `Wahad@2024` | admin |

### User Login — `/login`

Same accounts above work here too. Regular users can also register via sign-up.

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

1. Push to GitHub
2. Import repo in Vercel
3. Set root directory to `frontend`
4. Add env var: `NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app`

### Backend — Railway

1. Connect GitHub repo in Railway
2. Set root directory to `server`
3. Add env vars:
   ```
   DATABASE_URL=postgresql://...
   FRONTEND_URL=https://your-app.vercel.app
   PORT=5000
   ```

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
