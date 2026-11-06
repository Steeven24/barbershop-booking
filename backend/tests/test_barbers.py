def create_barber(client, **overrides):
    payload = {"name": "Carlos", "phone": "0991234567", **overrides}
    response = client.post("/api/barbers", json=payload)
    assert response.status_code == 201
    return response.json()


def test_create_and_get_barber(client):
    barber = create_barber(client)
    response = client.get(f"/api/barbers/{barber['id']}")
    assert response.status_code == 200
    assert response.json()["name"] == "Carlos"
    assert response.json()["is_active"] is True


def test_get_missing_barber_returns_404(client):
    assert client.get("/api/barbers/999").status_code == 404


def test_update_barber(client):
    barber = create_barber(client)
    response = client.patch(f"/api/barbers/{barber['id']}", json={"name": "Carlos R."})
    assert response.status_code == 200
    assert response.json()["name"] == "Carlos R."
    assert response.json()["phone"] == "0991234567"


def test_delete_deactivates_and_hides_from_list(client):
    barber = create_barber(client)
    create_barber(client, name="Luis")
    assert client.delete(f"/api/barbers/{barber['id']}").status_code == 204

    names = [b["name"] for b in client.get("/api/barbers").json()]
    assert names == ["Luis"]
    all_barbers = client.get("/api/barbers", params={"include_inactive": True}).json()
    assert len(all_barbers) == 2


def test_replace_working_hours(client):
    barber = create_barber(client)
    schedule = [
        {"weekday": 5, "start_time": "09:00", "end_time": "14:00"},
        {"weekday": 0, "start_time": "09:00", "end_time": "18:00"},
    ]
    url = f"/api/barbers/{barber['id']}/working-hours"
    assert client.put(url, json=schedule).status_code == 200
    # Replacing again must not leave old rows behind
    response = client.put(url, json=schedule[:1])

    assert response.status_code == 200
    assert [wh["weekday"] for wh in client.get(url).json()] == [5]


def test_working_hours_rejects_duplicates_and_bad_ranges(client):
    barber = create_barber(client)
    url = f"/api/barbers/{barber['id']}/working-hours"
    day = {"weekday": 1, "start_time": "09:00", "end_time": "18:00"}
    assert client.put(url, json=[day, day]).status_code == 422
    bad = {**day, "start_time": "18:00", "end_time": "09:00"}
    assert client.put(url, json=[bad]).status_code == 422
