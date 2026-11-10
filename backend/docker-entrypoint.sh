#!/bin/sh
set -e

# Bring the database schema up to date before starting the API
alembic upgrade head

exec "$@"
