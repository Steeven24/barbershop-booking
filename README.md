<div align="center">

# ✂️ Barbershop Booking

**Online appointment booking for barbershops.**
Customers pick a service, a barber and a free time slot; owners manage the
agenda, the team and the schedule from an admin panel.

[![CI](https://github.com/Steeven24/barbershop-booking/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/Steeven24/barbershop-booking/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

<img src="docs/screenshots/booking.png" alt="Booking flow: choosing a day and time slot" width="900">

</div>

## ✨ Features

**For customers**

- Home page with services, prices, team and opening hours
- 4-step booking: service → barber → day & time → contact details
- Real-time availability from each barber's weekly schedule and existing bookings
- Email when the booking is received, confirmed or cancelled

**For the barbershop**

- Admin panel with secure login (JWT, Argon2 password hashing)
- Daily agenda with filters, a summary of the day and one-click status changes
- Manage barbers, services and each barber's weekly schedule

**Under the hood**

- Double-booking protection with row locking, plus a friendly retry in the UI
- All times handled in the business timezone
- Fully configured through environment variables — no secrets in the repo
- Tested API, CI on every pull request and a one-command Docker setup

## Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React + Vite                   |
| Backend  | FastAPI + SQLAlchemy + Alembic |
| Database | PostgreSQL                     |

## Monorepo structure

```
barbershop-booking/
├── backend/    # FastAPI REST API
├── frontend/   # React SPA
└── docker-compose.yml
```

## Branching model

- `main` — stable, production-ready code
- `develop` — integration branch
- `feature/*` — new features, branched from `develop` and merged back via PR

Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
(`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, ...).

## Getting started

### Requirements

- Docker (for PostgreSQL)
- Python 3.12+ and [uv](https://docs.astral.sh/uv/)
- Node.js 20+

### Environment variables

Credentials are never stored in the repo. Copy the examples and fill them in:

```bash
cp .env.example .env                  # PostgreSQL user, password and database
cp backend/.env.example backend/.env  # DATABASE_URL, SECRET_KEY, ...
```

- `DATABASE_URL` must use the same user, password and database as the root `.env`.
- Generate `SECRET_KEY` with `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
- The backend refuses to start if `DATABASE_URL` or `SECRET_KEY` are missing.

### Database and local email

```bash
docker compose up -d db mailpit
```

[Mailpit](https://mailpit.axllent.org/) catches every email sent in development;
open http://localhost:8025 to read them. To use it, set in `backend/.env`:
`SMTP_HOST=localhost`, `SMTP_PORT=1025`, `SMTP_STARTTLS=false`. Without
`SMTP_HOST` emails are only written to the backend log. For production use any
SMTP provider through the `SMTP_*` variables.

### Backend

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run python -m app.cli create-admin owner@example.com "Owner Name"
uv run fastapi dev app/main.py
```

API docs available at http://localhost:8000/docs

Create a new migration after changing models:

```bash
uv run alembic revision --autogenerate -m "describe change"
```

Run tests (needs the `db` container running; uses a separate `<database>_test`
database created automatically, or `TEST_DATABASE_URL` if set):

```bash
uv run pytest
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at http://localhost:5173. During development Vite proxies
`/api` requests to the backend on port 8000, so start the backend first.

The admin panel lives at http://localhost:5173/admin. Sign in with the account
created by `python -m app.cli create-admin`.

### API endpoints

Admin endpoints require a token: get one with `POST /api/auth/login` and send
it as `Authorization: Bearer <token>`.

| Method | Path                              | Access | Description                  |
| ------ | --------------------------------- | ------ | ---------------------------- |
| POST   | `/api/auth/login`                 | Public | Get an admin access token    |
| GET    | `/api/auth/me`                    | Admin  | Current admin                |
| GET    | `/api/barbers`, `/api/barbers/{id}` | Public | List / get barbers         |
| POST   | `/api/barbers`                    | Admin  | Create barber                |
| PATCH  | `/api/barbers/{id}`               | Admin  | Update barber                |
| DELETE | `/api/barbers/{id}`               | Admin  | Deactivate barber            |
| GET    | `/api/barbers/{id}/working-hours` | Public | Weekly schedule              |
| PUT    | `/api/barbers/{id}/working-hours` | Admin  | Replace weekly schedule      |
| GET    | `/api/services`, `/api/services/{id}` | Public | List / get services      |
| POST   | `/api/services`                   | Admin  | Create service               |
| PATCH  | `/api/services/{id}`              | Admin  | Update service               |
| DELETE | `/api/services/{id}`              | Admin  | Deactivate service           |
| GET    | `/api/availability`               | Public | Free slots for barber/day    |
| POST   | `/api/appointments`               | Public | Book an appointment          |
| GET    | `/api/appointments`               | Admin  | List with filters            |
| GET    | `/api/appointments/{id}`          | Admin  | Get appointment              |
| PATCH  | `/api/appointments/{id}/status`   | Admin  | Confirm / complete / cancel  |

Appointment status flow: `pending → confirmed → completed | no_show`,
and `pending | confirmed → cancelled`. Times are handled in the business
timezone (`TIMEZONE`, default `America/Guayaquil`).
