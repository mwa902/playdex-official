# Azure Debug Plan

> This plan is the source of truth for generating the
> VS Code debug setup in this workspace.
>
> **Status:** Executing
> **Execution Mode:** Auto
> **Created:** 2026-09-20T00:00:00Z
> **Last Updated:** 2026-09-20T00:00:00Z

## Prerequisites

| Tool / Extension | Category | Service(s) | Installed | Version |
|------------------|----------|------------|-----------|---------|
| Node.js | Runtime | backend, frontend | ✅ | 22.16.0 |
| npm | Package manager | backend, frontend | ✅ | 11.4.1 |
| PostgreSQL client (psql) | Database tooling | backend | ❓ | — |
| Docker Compose | Orchestration | backend | ❓ | — |
| Azure CLI | Tooling | backend, frontend | ❓ | — |
| Docker Desktop / Docker Engine | Container runtime | backend | ❓ | — |
| VS Code extension: ms-azuretools.vscode-docker | Debug tooling | backend | ❓ | — |
| VS Code JavaScript Debugger | Debug tooling | backend, frontend | ✅ | Built-in |

> ⚠️ **Action required:** Confirm any tool or extension marked ❓ is installed and ready before approving this plan — rerun the recheck to confirm CLI tools provided by a version manager.

## Debug Configurations

| Generate | Debug Config Name | Service Label | Service Root | Project Type | Runtime | Version | Azure Dependencies |
|----------|-------------------|---------------|--------------|--------------|---------|---------|---------------------|
| [x] | Playdex API (debug) | Playdex API | ./ | app-service | node-ts | 22.16.0 | PostgreSQL |
| [x] | Playdex Operations Console (debug) | Playdex Operations Console | ./frontend | frontend-spa | node-ts | 22.16.0 | — |
| [x] | Debug All Services | Debug All Services | — | *Compound Config* | — | — | — |

<details>
<summary>ℹ️ Project Type Descriptions</summary>

| Project Type | Description |
|-------------|-------------|
| app-service | HTTP server application implemented with NestJS and served by Node.js. |
| frontend-spa | Next.js App Router web application served by a Node.js development server. |

</details>

> ℹ️ **Integration:** The frontend calls the API directly at `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000`); no Next.js rewrite or proxy was detected. The API enables CORS for the local frontend origin.

## Orchestrator

| Orchestrator | Container Runtime | Compose Command | Description |
|-------------|-------------------|-----------------|-------------|
| Docker Compose | Docker | `docker compose` | Default Compose provider for the PostgreSQL emulator because no Docker or Podman runtime was confirmed during scanning. |

## Emulators

| Dependent Service | Emulator | Purpose |
|-------------------|----------|---------|
| PostgreSQL | PostgreSQL Container | Local relational database for users, organizations, venues, events, event types, and bookings. |

## Architecture Diagram

During local debugging, the Next.js console and NestJS API run as separate Node.js services while the API connects to a PostgreSQL container; the frontend reaches the API at `localhost:3000`.

```mermaid
graph LR
    API["Playdex API<br/>NestJS :3000"] -->|"pg"| PG[("PostgreSQL<br/>:5432")]
    WEB["Playdex Operations Console<br/>Next.js :3001"] -->|"HTTP / CORS"| API
```

## Migrations

When selected, the generation phase creates automated VS Code tasks that run migration setup before the API starts debugging. The NestJS database module already applies ordered raw SQL files from `libs/database/migrations` during module initialization.

| Generate | Service | Migration Tool |
|----------|---------|---------------|
| [x] | Playdex API | Raw SQL migration runner |

## API Test Collections

When selected, the generation phase produces lightweight, runnable API test scripts so the routes can be smoke-tested once the API and PostgreSQL emulator are running.

| Generate | Service | Description |
|----------|---------|-------------|
| [x] | Playdex API | <details><summary>HTTP Endpoints (39)</summary><br>GET /<br>GET /users<br>GET /users/:id<br>POST /users<br>PUT /users/:id<br>DELETE /users/:id<br>POST /users/migrate<br>GET /organization<br>GET /organization/:id<br>POST /organization<br>PATCH /organization/:id<br>DELETE /organization/:id<br>POST /organization/migrate<br>GET /venues<br>GET /venues/:id<br>POST /venues<br>PUT /venues/:id<br>DELETE /venues/:id<br>POST /venues/migration<br>GET /venues/migration/sql<br>GET /events<br>GET /events/:id<br>POST /events<br>PUT /events/:id<br>DELETE /events/:id<br>POST /events/migration<br>GET /event-types<br>GET /event-types/:id<br>POST /event-types<br>PUT /event-types/:id<br>DELETE /event-types/:id<br>POST /event-types/migration<br>GET /event-types/migration/sql<br>GET /bookings<br>GET /bookings/:id<br>POST /bookings<br>PUT /bookings/:id<br>DELETE /bookings/:id<br>POST /bookings/migration<br><br></details> |

## Convenience Scripts

| Generate | Script | Registered In | Description |
|----------|--------|---------------|-------------|
| [x] | emulators:start | ./package.json | Start the PostgreSQL emulator in the background using the configured Compose provider. |
| [x] | emulators:stop | ./package.json | Stop the local PostgreSQL emulator. |
| [x] | emulators:clean | ./package.json | Stop the emulator and remove its local data for a fresh database. |
| [x] | db:migrate | ./package.json | Run the API migration setup against the local PostgreSQL database. |

## Debug Configuration Checklist

Debug Configuration Checklist:
❌ Playdex API (debug) — build validation succeeded via `npm run build`; runtime validation is blocked because Docker is not installed in this environment (`docker info` -> CommandNotFoundException).
❌ Playdex Operations Console (debug) — generated and validated for JSON/task shape; frontend runtime validation requires a local Next.js dev server and a running API/emulator stack.
❌ Debug All Services — compound orchestration cannot be proven here because the PostgreSQL emulator cannot start without Docker/Compose available.