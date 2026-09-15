# Adphira Backend — FastAPI

A complete, self-hostable FastAPI mirror of the application's backend. The live
Lovable app runs on managed Postgres + server functions; this project gives you
the same data model, business rules and API surface as a portable Python
service you can deploy anywhere (Docker, Fly, Render, EC2, Kubernetes).

## Layout

```
backend/
  app/
    main.py              FastAPI app factory, router mounting, middleware
    core/
      config.py          Pydantic settings (env-driven)
      security.py        Password hashing, JWT issue/verify
      errors.py          Typed API errors + global handlers
      middleware.py      Request ID, timing, access log, security headers
    db/
      session.py         Async engine + session dependency
      base.py            Declarative base + shared mixins
    models/              SQLAlchemy ORM models (mirrors the SQL schema)
    schemas/             Pydantic request/response models
    repositories/        Data access layer (no HTTP, no business rules)
    services/            Business logic (auth, content, CRM, portal)
    api/
      deps.py            Auth/role dependencies
      v1/                Routers: auth, content, forms, crm, portal, admin
  alembic/               Migrations
  tests/                 Pytest suite
```

## Run locally

```bash
cd backend
cp .env.example .env          # then edit DATABASE_URL + JWT_SECRET
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Docs: http://localhost:8000/docs

Or: `docker compose up --build`

## Auth

- `POST /api/v1/auth/register` → creates a user with role `user`
- `POST /api/v1/auth/login` → `{ access_token, refresh_token }` (JWT, HS256)
- `POST /api/v1/auth/refresh`
- `GET  /api/v1/auth/me`

Roles: `user`, `admin`. Admin-only routes use the `require_admin` dependency.
Portal clients may only read rows linked to their own `portal_clients.id` — the
Python equivalent of the row-level security policies used in the live app.

## Endpoint groups

| Prefix | Purpose | Access |
| --- | --- | --- |
| `/api/v1/auth` | register, login, refresh, me | public / bearer |
| `/api/v1/content` | services, portfolio, blog, FAQs, pricing, team, testimonials, stats, process, clients, case studies, page SEO | public read |
| `/api/v1/forms` | contact, quote request, booking, newsletter, site audit, lead | public write |
| `/api/v1/crm` | leads, notes, proposals, invoices | admin |
| `/api/v1/portal` | my profile, projects, milestones, tasks, documents, messages, notifications, invoices, support tickets | client |
| `/api/v1/admin` | full CRUD over every content table + submissions | admin |

## Notes

- All list endpoints support `limit`/`offset` and return `X-Total-Count`.
- Every write is validated by Pydantic v2 schemas mirroring the DB constraints.
- Errors return `{"error": {"code", "message", "details"}}` with a request id.
