import os
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

import app.models
from app.config import settings
from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    make_url(settings.database_url)
    .set(database="barbershop_test")
    .render_as_string(hide_password=False),
)


def ensure_database_exists(url: str) -> None:
    target = make_url(url)
    admin = create_engine(target.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        exists = conn.scalar(
            text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": target.database}
        )
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{target.database}"'))
    admin.dispose()


@pytest.fixture(scope="session")
def engine():
    ensure_database_exists(TEST_DATABASE_URL)
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def client(engine):
    TestSession = sessionmaker(bind=engine, autoflush=False)

    def override_get_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

    tables = ", ".join(t.name for t in Base.metadata.sorted_tables)
    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))


@pytest.fixture
def next_monday():
    """A Monday at least one week ahead, so slots are always in the future."""
    today = date.today()
    return today + timedelta(days=7 + (7 - today.weekday()) % 7)


@pytest.fixture
def barber(client):
    barber = client.post("/api/barbers", json={"name": "Carlos"}).json()
    schedule = [{"weekday": 0, "start_time": "09:00", "end_time": "12:00"}]
    client.put(f"/api/barbers/{barber['id']}/working-hours", json=schedule)
    return barber


@pytest.fixture
def service(client):
    payload = {"name": "Haircut", "duration_minutes": 30, "price": "8.50"}
    return client.post("/api/services", json=payload).json()
