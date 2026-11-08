import pytest

from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD
from tests.test_availability import book, local_iso


def login(client, email=ADMIN_EMAIL, password=ADMIN_PASSWORD):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def test_login_returns_token_usable_on_me(public_client, admin):
    response = login(public_client, email=ADMIN_EMAIL.upper())
    assert response.status_code == 200
    token = response.json()["access_token"]

    me = public_client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == ADMIN_EMAIL


@pytest.mark.parametrize(
    "email, password", [(ADMIN_EMAIL, "wrong-pass"), ("nobody@example.com", ADMIN_PASSWORD)]
)
def test_login_with_bad_credentials_fails(public_client, admin, email, password):
    response = login(public_client, email, password)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_invalid_token_is_rejected(public_client):
    response = public_client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert response.status_code == 401


@pytest.mark.parametrize(
    "method, path",
    [
        ("post", "/api/barbers"),
        ("patch", "/api/barbers/1"),
        ("delete", "/api/barbers/1"),
        ("put", "/api/barbers/1/working-hours"),
        ("post", "/api/services"),
        ("delete", "/api/services/1"),
        ("get", "/api/appointments"),
        ("get", "/api/appointments/1"),
        ("patch", "/api/appointments/1/status"),
    ],
)
def test_management_endpoints_require_auth(public_client, method, path):
    assert getattr(public_client, method)(path).status_code == 401


def test_public_endpoints_stay_open(public_client, client, barber, service, next_monday):
    assert public_client.get("/api/barbers").status_code == 200
    assert public_client.get("/api/services").status_code == 200
    params = {"barber_id": barber["id"], "service_id": service["id"], "day": next_monday}
    assert public_client.get("/api/availability", params=params).status_code == 200
    assert book(public_client, barber, service, local_iso(next_monday, 10)).status_code == 201
