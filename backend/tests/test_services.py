SERVICE = {"name": "Haircut", "duration_minutes": 30, "price": "8.50"}


def test_create_and_list_services(client):
    response = client.post("/api/services", json=SERVICE)
    assert response.status_code == 201
    assert response.json()["price"] == "8.50"

    services = client.get("/api/services").json()
    assert [s["name"] for s in services] == ["Haircut"]


def test_duplicate_service_name_returns_409(client):
    client.post("/api/services", json=SERVICE)
    response = client.post("/api/services", json=SERVICE)
    assert response.status_code == 409


def test_rename_to_existing_name_returns_409(client):
    client.post("/api/services", json=SERVICE)
    beard = client.post("/api/services", json={**SERVICE, "name": "Beard trim"}).json()
    response = client.patch(f"/api/services/{beard['id']}", json={"name": "Haircut"})
    assert response.status_code == 409


def test_invalid_duration_and_price_are_rejected(client):
    assert client.post("/api/services", json={**SERVICE, "duration_minutes": 0}).status_code == 422
    assert client.post("/api/services", json={**SERVICE, "price": "-1"}).status_code == 422


def test_update_and_deactivate_service(client):
    service = client.post("/api/services", json=SERVICE).json()
    url = f"/api/services/{service['id']}"

    response = client.patch(url, json={"price": "10.00"})
    assert response.json()["price"] == "10.00"
    assert response.json()["duration_minutes"] == 30

    assert client.delete(url).status_code == 204
    assert client.get("/api/services").json() == []
    assert client.get(url).json()["is_active"] is False
