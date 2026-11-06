# Barbershop Booking

Online appointment booking system for barbershops — clients pick a barber,
service and time slot; owners manage schedules and bookings.

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

### Database

```bash
docker compose up -d db
```

### Backend

```bash
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run fastapi dev app/main.py
```

API docs available at http://localhost:8000/docs

Create a new migration after changing models:

```bash
uv run alembic revision --autogenerate -m "describe change"
```

Run tests (needs the `db` container running; uses a separate
`barbershop_test` database, created automatically):

```bash
uv run pytest
```

### API endpoints

| Method         | Path                                  | Description                 |
| -------------- | ------------------------------------- | --------------------------- |
| GET/POST       | `/api/barbers`                        | List / create barbers       |
| GET/PATCH/DEL  | `/api/barbers/{id}`                   | Get / update / deactivate   |
| GET/PUT        | `/api/barbers/{id}/working-hours`     | Get / replace weekly hours  |
| GET/POST       | `/api/services`                       | List / create services      |
| GET/PATCH/DEL  | `/api/services/{id}`                  | Get / update / deactivate   |
