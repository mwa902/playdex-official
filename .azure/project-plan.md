# Project Plan

**Status**: Integrated
**Created**: 2026-09-20
**Mode**: AUGMENT
**Execution Mode**: auto

---

## 1. Project Overview

**Goal**: Preserve and extend the existing NestJS event-booking and venue-management API with a Next.js web frontend for users, organizations, venues, events, bookings, and event types. The project is designed so that every module is independently testable.

**App Type**: SPA + API

**API Login**: Yes

**Mode**: AUGMENT

**Deployment Plan**: No deployment plan found

---

## 2. Backend — NestJS API Service

| Component | Technology |
|-----------|-----------|
| **Language** | TypeScript |
| **Runtime** | Node |
| **Package Manager** | npm |
| **Test Runner** | jest |
| **Mocking Library** | jest.mock |
| **Test Command** | npm test |
| **Orchestration** | docker-compose |

**Existing backend contract**: Keep the current root NestJS application, `src/` modules, `libs/` libraries, SQL migrations, tests, and controller route paths. The backend runs with `npm run start:dev`, builds with `npm run build`, and serves locally on `http://localhost:3000`. Frontend integration may enable CORS for the local and deployed frontend origins without renaming or removing existing routes.

---

## 3. Frontend — Next.js Web App

| Component | Technology |
|-----------|-----------|
| **Directory** | `frontend/` |
| **Language** | TypeScript |
| **Framework** | Next.js App Router |
| **Runtime** | Node |
| **Package Manager** | npm |
| **Test Runner** | jest |
| **Mocking Library** | jest.mock |
| **Dev Command** | `cd frontend && npm run dev` |
| **Build Command** | `cd frontend && npm run build` |
| **Test Command** | `cd frontend && npm test` |

**API base URL**: Configure `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local`; the local default is `http://localhost:3000` and the deployed value is the NestJS API origin. Client and server components use a small typed fetch client that joins this base URL to the existing backend paths such as `/events`, `/venues`, `/bookings`, and `/users`. The frontend must not duplicate or reinterpret the NestJS route contract. Requests requiring login include the existing session/auth information expected by the API. 

**Connection approach**: Use browser/server fetches from Next.js to the NestJS API, with CORS configured on the NestJS app for the frontend origin. Keep API errors and loading states in the frontend boundary; do not move backend business logic into Next.js API routes.

---

## 4. Services Required

| Azure Service | Role in App | Environment Variable | Default Value (Local) | Classification |
|---------------|------------|---------------------|----------------------|----------------|
| PostgreSQL | Primary data store for user, organization, venue, event, event type, and booking records | DATABASE_URL | postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/playdex | Essential |

---

## 5. Prerequisites

### Run

| Tool | Service(s) | Installed | Version |
|------|------------|-----------|---------|
| Node.js | Backend, Frontend | ✅ | v22.16.0 |
| npm | Backend, Frontend | ✅ | 11.4.1 |
| PostgreSQL client (psql) | Backend | ❓ | unknown |
| Docker Compose | Backend | ❓ | unknown |
| Azure CLI | Backend, Frontend | ❓ | unknown |

### Debug

| Tool | Service(s) | Installed | Version |
|------|------------|-----------|---------|
| Docker Desktop / Docker Engine | Backend | ❓ | unknown |
| VS Code extension: ms-azuretools.vscode-docker | Backend | ❓ | unknown |

---

## 6. Design System & UI

**Component Library**: Fluent UI v9
**Style Direction**: A focused sports operations console with compact data views, clear status emphasis, restrained elevation, and responsive layouts that work for organizers and participants.
**Typography**: Segoe UI Variable, Segoe UI, sans-serif

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0f5b78` | Navigation, primary actions, active links, and event-management controls |
| `accent` | `#d97706` | Booking status highlights, schedule emphasis, and important calls to action |
| `surface` | `#f5f7f8` | Application background and page surfaces |
| `text` | `#17212b` | Main headings, labels, and record values |
| `muted` | `#64727d` | Secondary metadata, timestamps, and supporting copy |
| `border` | `#d5dde2` | Tables, cards, form controls, and section dividers |

### Pages

| Page | Route | Purpose | Layout |
|------|-------|---------|--------|
| Operations Dashboard | `/` | Surface upcoming events, active bookings, venues, and operational status. | `header, nav, main, grid, card-list, table, actions` |
| Events | `/events` | Browse and manage events from the existing `/events` API route. | `header, nav, main, table, actions, modal` |
| Event Detail | `/events/[id]` | Inspect one event and its bookings, venue, and event type. | `header, nav, main, two-column(table+actions), action-bar` |
| Venues | `/venues` | Browse and manage venues from the existing `/venues` API route. | `header, nav, main, card-list, form, modal` |
| Bookings | `/bookings` | Review booking records and status from the existing `/bookings` API route. | `header, nav, main, table, tabs, actions` |

### Sample Content

```
Operations Dashboard — event:
| Event | Venue | Date | Status |
| Northside Open | Northside Tennis Center | 2026-10-04 | Published |
| Riverside Doubles League | Riverside Courts | 2026-10-11 | Registration open |
| Winter Indoor Cup | Central Sports Hall | 2026-11-22 | Draft |

Events — event:
| Event | Type | Venue | Capacity |
| Northside Open | Tournament | Northside Tennis Center | 64 |
| Riverside Doubles League | League | Riverside Courts | 32 |
| Winter Indoor Cup | Tournament | Central Sports Hall | 48 |

Event Detail — Northside Open: Venue: Northside Tennis Center · Date: 2026-10-04 · Capacity: 64 · Status: Published

Venues — venue:
| Venue | City | Courts | Availability |
| Northside Tennis Center | Manchester | 8 | Available |
| Riverside Courts | Leeds | 6 | Limited |
| Central Sports Hall | Birmingham | 4 | Available |

Bookings — booking:
| Participant | Event | Created | Status |
| Maya Patel | Northside Open | 2026-09-16 | Confirmed |
| Oliver Reed | Riverside Doubles League | 2026-09-17 | Pending |
| Sofia Khan | Northside Open | 2026-09-18 | Waitlisted |
```

---

## 7. Project Structure

```
playdex-official/
├── .azure/
│   ├── project-plan.md
│   └── requirements.json
├── frontend/
│   ├── app/
│   │   ├── events/
│   │   │   └── [id]/
│   │   ├── bookings/
│   │   ├── venues/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── api-client.ts
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── libs/
│   ├── common/
│   │   ├── src/
│   │   └── tsconfig.lib.json
│   └── database/
│       ├── migrations/
│       │   ├── 01_create_users.sql
│       │   ├── 02_create_organization.sql
│       │   ├── 03_create_venue.sql
│       │   ├── 04_create_event_type.sql
│       │   ├── 05_create_events.sql
│       │   ├── 06_create_booking.sql
│       │   └── 07_update_user.sql
│       └── src/
│           ├── database.module.ts
│           ├── database.service.ts
│           ├── database.service.spec.ts
│           ├── index.ts
│           └── migration.ts
├── src/
│   ├── app.controller.ts
│   ├── app.controller.spec.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── booking/
│   │   ├── booking.controller.ts
│   │   ├── booking.module.ts
│   │   ├── booking.service.ts
│   │   └── dto/
│   ├── event/
│   │   ├── event.controller.ts
│   │   ├── event.module.ts
│   │   ├── event.service.ts
│   │   └── dto/
│   ├── event_type/
│   │   ├── event_type.controller.ts
│   │   ├── event_type.module.ts
│   │   ├── event_type.service.ts
│   │   └── interfaces/
│   ├── filters/
│   ├── guards/
│   │   └── auth/
│   ├── main.ts
│   ├── middlewares/
│   │   └── login/
│   ├── organization/
│   │   ├── organization.controller.ts
│   │   ├── organization.module.ts
│   │   ├── organization.service.ts
│   │   └── dto/
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.module.ts
│   │   ├── user.service.ts
│   │   └── dto/
│   ├── venue/
│   │   ├── venue.controller.ts
│   │   ├── venue.module.ts
│   │   ├── venue.service.ts
│   │   └── interfaces/
│   └── test/
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.build.json
├── tsconfig.json
├── .gitignore
├── .eslintrc.js
├── .prettierrc
└── .npmrc
```

---

## 8. Route Definitions

| # | Method | Path | Description | Request Body | Response Body | Status Codes |
|---|--------|------|-------------|-------------|--------------|--------------|
| 1 | GET | `/` | Existing NestJS root response | — | `string` | 200 |
| 2 | GET | `/users` | List all users | — | `User[]` | 200 |
| 3 | GET | `/users/:id` | Get a single user | — | `User` | 200, 404 |
| 4 | POST | `/users` | Create a user | `{ name, email, ... }` | `User` | 201 |
| 5 | DELETE | `/users/:id` | Delete a user | — | `{ deleted: boolean }` | 200 |
| 6 | GET | `/organization` | List organizations | — | `Organization[]` | 200 |
| 7 | POST | `/organization` | Create an organization | `{ name, ... }` | `Organization` | 201 |
| 8 | GET | `/organization/:id` | Get an organization | — | `Organization` | 200, 404 |
| 9 | PATCH | `/organization/:id` | Update an organization | `{ ... }` | `Organization` | 200 |
| 10 | DELETE | `/organization/:id` | Delete an organization | — | `{ deleted: boolean }` | 200 |
| 11 | GET | `/venues` | List venues | — | `Venue[]` | 200 |
| 12 | GET | `/venues/:id` | Get a venue | — | `Venue` | 200, 404 |
| 13 | POST | `/venues` | Create a venue | `{ ... }` | `Venue` | 201 |
| 14 | DELETE | `/venues/:id` | Delete a venue | — | `{ deleted: boolean }` | 200 |
| 15 | GET | `/events` | List events | — | `Event[]` | 200 |
| 16 | GET | `/events/:id` | Get an event | — | `Event` | 200, 404 |
| 17 | POST | `/events` | Create an event | `{ ... }` | `Event` | 201 |
| 18 | DELETE | `/events/:id` | Delete an event | — | `{ deleted: boolean }` | 200 |
| 19 | GET | `/event-types` | List event types | — | `EventType[]` | 200 |
| 20 | GET | `/event-types/:id` | Get an event type | — | `EventType` | 200, 404 |
| 21 | POST | `/event-types` | Create an event type | `{ ... }` | `EventType` | 201 |
| 22 | DELETE | `/event-types/:id` | Delete an event type | — | `{ deleted: boolean }` | 200 |
| 23 | GET | `/bookings` | List bookings | — | `Booking[]` | 200 |
| 24 | GET | `/bookings/:id` | Get a booking | — | `Booking` | 200, 404 |
| 25 | POST | `/bookings` | Create a booking | `{ ... }` | `Booking` | 201 |
| 26 | DELETE | `/bookings/:id` | Delete a booking | — | `{ deleted: boolean }` | 200 |

The existing migration helper endpoints under `/users/migrate`, `/organization/migrate`, `/venues/migration`, `/events/migration`, `/event-types/migration`, `/event-types/migration/sql`, and `/bookings/migration` remain backend-only maintenance routes and are not required by the frontend navigation.

---

## 9. Next Steps

1. Run **azure-project-scaffold** to execute this plan
2. Run **azure-project-integrate** to wire the Next.js frontend to live NestJS data, smoke-test the existing API, and create or validate the database migrations
3. Run **azure-debug-plan** → **azure-debug-generate** for local Docker and VS Code debugging support
4. Run the **azure-deploy** agent when ready; it uses **azure-app-onboard** for architecture, cost estimation, IaC generation, provisioning, and health verification
