# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-11-09

First stable release.

### Added

- Public site: home page with services, prices, team and opening hours
- Online booking in four steps (service, barber, day and time, contact details)
- Real-time availability from each barber's weekly schedule and existing bookings
- Double-booking protection with row locking and a retry flow in the UI
- Appointment status flow: pending, confirmed, completed, no-show, cancelled
- Admin authentication with JWT and Argon2 password hashing, plus a
  `create-admin` command
- Admin panel: daily agenda with filters, day summary and status actions
- Catalog management: barbers, services and weekly schedules
- Customer emails when a booking is received, confirmed or cancelled
- Configuration through environment variables, with no secrets in the repository
- Docker images for backend and frontend, and a full `docker compose` setup
  with PostgreSQL and Mailpit
- GitHub Actions CI: backend lint and tests, frontend lint and build, Docker builds

[1.0.0]: https://github.com/Steeven24/barbershop-booking/releases/tag/v1.0.0
