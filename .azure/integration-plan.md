# Integration Handoff

## Backend
- Folder: repository root
- Run: `npm run start:dev`
- Port: `3000`
- Build: `npm run build`
- Health: `/`
- Existing NestJS modules, routes, SQL migrations, and tests remain authoritative.

## Frontend
- Folder: `frontend/`
- Dev: `npm run dev`
- Build: `npm run build`
- Test: `npm test`
- API seam: `frontend/lib/api.ts`; swap `mockClient` export to `liveClient` after endpoint verification.
- Mock files to delete after wiring: `frontend/lib/mock-client.ts`; remove mock datasets and any dev-only preview state controls if no longer needed.
- Shared client/types currently live in `frontend/lib/api-client.ts`; preserve typed method-for-method contract.

## API routes
- GET `/`
- GET `/users`
- GET `/users/:id`
- POST `/users`
- DELETE `/users/:id`
- GET `/organization`
- POST `/organization`
- GET `/organization/:id`
- PATCH `/organization/:id`
- DELETE `/organization/:id`
- GET `/venues`
- GET `/venues/:id`
- POST `/venues`
- DELETE `/venues/:id`
- GET `/events`
- GET `/events/:id`
- POST `/events`
- DELETE `/events/:id`
- GET `/event-types`
- GET `/event-types/:id`
- POST `/event-types`
- DELETE `/event-types/:id`
- GET `/bookings`
- GET `/bookings/:id`
- POST `/bookings`
- DELETE `/bookings/:id`
- Maintenance: `/users/migrate`, `/organization/migrate`, `/venues/migration`, `/events/migration`, `/event-types/migration`, `/event-types/migration/sql`, `/bookings/migration`.
- Auth requirement from plan: API Login is Yes. Verify or add registration, login, current-user, logout, cookie/JWT middleware, and create-account flow before protecting feature routes.

## Database
- Type: PostgreSQL
- Connection: `DATABASE_URL` (local default `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/playdex`)
- Migration tool/directory: existing SQL migration helper; `libs/database/migrations/`
- Create or validate schema migrations for users, organization, venue, event type, events, and booking.
- **NO seed data is to be created.**

## Services
- PostgreSQL: Essential
- No Enhancement services specified.

## Validation notes
- Backend build should be run from repository root.
- Frontend source scaffold is present; dependency install/build was blocked in this session by repeated npm registry `ECONNRESET` during package extraction. Reinstall dependencies in `frontend/` before build verification.

## Integration results
- Live API seam is active: `frontend/lib/api.ts` now exports the typed live client instead of the mock client, and the app no longer uses mock data for page loads.
- Backend smoke validation passed for the running service: `GET /` returned `200`, and the core list routes `/users`, `/organization`, `/venues`, `/events`, `/event-types`, and `/bookings` all returned `200`.
- Frontend production build completed successfully after clearing stale Next.js cache artifacts and setting the local API base URL.
- No seed data was created; only schema migration files were retained as required.
- The local PostgreSQL service is not installed in this environment, so the app runs with its in-memory handlers while the database connection remains externalized via `DATABASE_URL`.

## Integration results

- PostgreSQL migrations are repeatable schema-only migrations with foreign keys, checks, indexes, and no seed data.
- Backend build passed and all registered health, list, and maintenance routes returned successful responses or expected validation responses.
- Frontend API seam now uses `liveClient`; mock client, sample datasets, preview-state controls, and hardcoded dashboard metrics are no longer used.
- Frontend production build passed after stopping the concurrent dev server.
- Frontend dev server ran on port 3001 while the backend ran on port 3000; the dashboard loaded and its live collection requests returned empty arrays from the backend.
- Local PostgreSQL was not running on port 5432, so migration application against a live database remains pending local infrastructure availability.
