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

Setup instructions will be added as each part of the project lands.
