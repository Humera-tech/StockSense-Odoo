import pytest

from app.core.config import settings

VALID_SIGNUP = {
    "login_id": "newuser1",
    "email": "new@example.com",
    "name": "New User",
    "password": "Strong@Pass1",
    "confirm_password": "Strong@Pass1",
}


def error_of(response):
    return response.json()["error"]


# --- auth ---

@pytest.mark.parametrize(
    "override, field, message",
    [
        ({"login_id": "abc"}, "login_id", "Login ID must be 6–12 characters"),
        ({"login_id": "waytoolongloginid"}, "login_id", "Login ID must be 6–12 characters"),
        ({"email": "not-an-email"}, "email", "Enter a valid email"),
        ({"password": "Short@1", "confirm_password": "Short@1"}, "password", "Password must be more than 8 characters"),
        ({"password": "nouppercase@1", "confirm_password": "nouppercase@1"}, "password", "Password needs at least one uppercase letter"),
        ({"password": "NOLOWERCASE@1", "confirm_password": "NOLOWERCASE@1"}, "password", "Password needs at least one lowercase letter"),
        ({"password": "NoSpecial123", "confirm_password": "NoSpecial123"}, "password", "Password needs at least one special character"),
        ({"confirm_password": "Different@1"}, "confirm_password", "Passwords do not match"),
    ],
)
def test_signup_rules(client, override, field, message):
    response = client.post("/api/auth/signup", json={**VALID_SIGNUP, **override})
    assert response.status_code == 422
    assert error_of(response) == {"field": field, "message": message}


def test_signup_rejects_duplicates(client):
    assert client.post("/api/auth/signup", json=VALID_SIGNUP).status_code == 201
    dup_login = client.post("/api/auth/signup", json={**VALID_SIGNUP, "email": "other@example.com"})
    assert (dup_login.status_code, error_of(dup_login)["field"]) == (409, "login_id")
    dup_email = client.post("/api/auth/signup", json={**VALID_SIGNUP, "login_id": "another1", "email": "NEW@example.com"})
    assert (dup_email.status_code, error_of(dup_email)["message"]) == (409, "Email already registered")


def test_login_by_login_id_or_email_and_me(client):
    client.post("/api/auth/signup", json=VALID_SIGNUP)
    for identifier in ("newuser1", "new@example.com"):
        response = client.post("/api/auth/login", json={"login": identifier, "password": "Strong@Pass1"})
        assert response.status_code == 200
    token = response.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.json()["login_id"] == "newuser1"
    assert "password_hash" not in me.json()


@pytest.mark.parametrize("login", ["newuser1", "nobody99"])
def test_login_failure_is_generic(client, login):
    client.post("/api/auth/signup", json=VALID_SIGNUP)
    response = client.post("/api/auth/login", json={"login": login, "password": "Wrong@Pass1"})
    assert response.status_code == 401
    assert error_of(response)["message"] == "Invalid Login Id or Password"


def test_protected_routes_need_token(client):
    response = client.get("/api/products")
    assert response.status_code == 401
    assert error_of(response) == {"field": None, "message": "Not authenticated"}
    bad = client.get("/api/products", headers={"Authorization": "Bearer garbage"})
    assert bad.status_code == 401


def test_forgot_and_reset_password(client, monkeypatch):
    monkeypatch.setattr(settings, "show_dev_otp", True)
    client.post("/api/auth/signup", json=VALID_SIGNUP)
    otp = client.post("/api/auth/forgot", json={"email": "new@example.com"}).json()["dev_otp"]

    wrong = client.post("/api/auth/reset", json={
        "email": "new@example.com", "otp": "000000" if otp != "000000" else "111111",
        "password": "Fresh@Pass99", "confirm_password": "Fresh@Pass99",
    })
    assert error_of(wrong) == {"field": "otp", "message": "Invalid or expired code"}

    ok = client.post("/api/auth/reset", json={
        "email": "new@example.com", "otp": otp, "password": "Fresh@Pass99", "confirm_password": "Fresh@Pass99",
    })
    assert ok.status_code == 200
    assert client.post("/api/auth/login", json={"login": "newuser1", "password": "Fresh@Pass99"}).status_code == 200
    reused = client.post("/api/auth/reset", json={
        "email": "new@example.com", "otp": otp, "password": "Other@Pass99", "confirm_password": "Other@Pass99",
    })
    assert reused.status_code == 400


def test_forgot_does_not_reveal_unknown_email(client):
    response = client.post("/api/auth/forgot", json={"email": "ghost@example.com"})
    assert response.status_code == 200
    assert response.json()["dev_otp"] is None


# --- master data ---

def test_warehouse_create_adds_default_locations(auth_client):
    response = auth_client.post("/api/warehouses", json={"name": "Second", "short_code": "wh2"})
    assert response.status_code == 201
    wh = response.json()
    assert wh["short_code"] == "WH2"
    locations = auth_client.get("/api/locations", params={"warehouse_id": wh["id"]}).json()
    assert {(l["type"], l["full_code"]) for l in locations} == {
        ("INTERNAL", "WH2/Stock"), ("VENDOR", "Vendors"), ("CUSTOMER", "Customers"),
        ("ADJUSTMENT", "Inventory adjustment"),
    }
    dup = auth_client.post("/api/warehouses", json={"name": "Dup", "short_code": "WH2"})
    assert error_of(dup) == {"field": "short_code", "message": "Short code already exists"}


def test_location_rules(auth_client, seed):
    dup = auth_client.post("/api/locations", json={"name": "Again", "short_code": "stock1", "warehouse_id": seed.wh.id})
    assert (dup.status_code, error_of(dup)["field"]) == (409, "short_code")
    bad = auth_client.post("/api/locations", json={"name": "Rack", "short_code": "R 1", "warehouse_id": seed.wh.id})
    assert error_of(bad)["field"] == "short_code"
    created = auth_client.post("/api/locations", json={"name": "Rack A", "short_code": "RackA", "warehouse_id": seed.wh.id})
    assert created.json()["full_code"] == "WH/RackA"
    assert auth_client.delete(f"/api/locations/{created.json()['id']}").status_code == 204
    assert auth_client.delete(f"/api/locations/{seed.vendor.id}").status_code == 409


def test_product_sku_unique(auth_client):
    auth_client.post("/api/products", json={"sku": "lamp01", "name": "Lamp", "unit_cost": 10})
    dup = auth_client.post("/api/products", json={"sku": "LAMP01", "name": "Lamp 2", "unit_cost": 12})
    assert error_of(dup) == {"field": "sku", "message": "SKU already exists"}


# --- operations end to end ---

def post_receipt(client, seed, qty, **extra):
    return client.post("/api/operations", json={
        "type": "IN", "contact_id": seed.contact.id, "scheduled_date": "2026-09-26",
        "dest_location_id": seed.stock1.id, "lines": [{"product_id": seed.desk.id, "quantity": qty}], **extra,
    })


def desk_stock(client):
    rows = client.get("/api/stock", params={"search": "desk"}).json()
    return rows[0]["on_hand"], rows[0]["free_to_use"]


def test_receipt_end_to_end(auth_client, seed):
    created = post_receipt(auth_client, seed, 10)
    assert created.status_code == 201
    op = created.json()
    assert op["reference"] == "WH/IN/0001"
    assert op["status"] == "DRAFT"
    assert op["responsible"]["login_id"] == "hamza01"
    assert op["src_location"]["type"] == "VENDOR"
    assert op["dest_location"]["full_code"] == "WH/Stock1"

    assert auth_client.post(f"/api/operations/{op['id']}/todo").json()["status"] == "READY"
    assert auth_client.post(f"/api/operations/{op['id']}/validate").json()["status"] == "DONE"
    assert desk_stock(auth_client) == (10, 10)

    again = auth_client.post(f"/api/operations/{op['id']}/validate")
    assert again.status_code == 409


def test_delivery_waiting_then_ready(auth_client, seed):
    receipt = post_receipt(auth_client, seed, 10).json()
    auth_client.post(f"/api/operations/{receipt['id']}/todo")
    auth_client.post(f"/api/operations/{receipt['id']}/validate")

    delivery = auth_client.post("/api/operations", json={
        "type": "OUT", "contact_id": seed.contact.id, "scheduled_date": "2026-09-26",
        "src_location_id": seed.stock1.id, "lines": [{"product_id": seed.desk.id, "quantity": 15}],
    }).json()
    assert delivery["reference"] == "WH/OUT/0001"
    waiting = auth_client.post(f"/api/operations/{delivery['id']}/todo").json()
    assert waiting["status"] == "WAITING"
    assert waiting["lines"][0]["reserved_qty"] == 10
    assert desk_stock(auth_client) == (10, 0)

    receipt2 = post_receipt(auth_client, seed, 5).json()
    auth_client.post(f"/api/operations/{receipt2['id']}/todo")
    auth_client.post(f"/api/operations/{receipt2['id']}/validate")
    assert auth_client.get(f"/api/operations/{delivery['id']}").json()["status"] == "READY"

    auth_client.post(f"/api/operations/{delivery['id']}/validate")
    assert desk_stock(auth_client) == (0, 0)


def test_operation_validation_errors(auth_client, seed):
    no_contact = post_receipt(auth_client, seed, 5, contact_id=None)
    assert error_of(no_contact) == {"field": "contact_id", "message": "Choose a contact"}
    zero = post_receipt(auth_client, seed, 0)
    assert error_of(zero) == {"field": "lines.0.quantity", "message": "Quantity must be a whole number greater than 0"}
    missing_date = auth_client.post("/api/operations", json={
        "type": "IN", "contact_id": seed.contact.id, "dest_location_id": seed.stock1.id, "lines": [],
    })
    assert error_of(missing_date) == {"field": "scheduled_date", "message": "This field is required"}


def test_list_search_by_reference_and_contact(auth_client, seed):
    post_receipt(auth_client, seed, 1)
    post_receipt(auth_client, seed, 2)
    by_ref = auth_client.get("/api/operations", params={"type": "IN", "q": "IN/0002"}).json()
    assert [o["reference"] for o in by_ref] == ["WH/IN/0002"]
    by_contact = auth_client.get("/api/operations", params={"q": "azure"}).json()
    assert len(by_contact) == 2
    assert auth_client.get("/api/operations", params={"q": "nobody"}).json() == []


def test_edit_draft_and_cancel(auth_client, seed):
    op = post_receipt(auth_client, seed, 3).json()
    edited = auth_client.put(f"/api/operations/{op['id']}", json={
        "contact_id": seed.contact.id, "scheduled_date": "2026-10-01", "dest_location_id": seed.stock1.id,
        "lines": [{"product_id": seed.chair.id, "quantity": 7}],
    }).json()
    assert [(l["product"]["sku"], l["quantity"]) for l in edited["lines"]] == [("CHAIR001", 7)]
    assert auth_client.post(f"/api/operations/{op['id']}/cancel").json()["status"] == "CANCELLED"
    blocked = auth_client.put(f"/api/operations/{op['id']}", json={
        "contact_id": seed.contact.id, "scheduled_date": "2026-10-01", "dest_location_id": seed.stock1.id,
        "lines": [{"product_id": seed.chair.id, "quantity": 1}],
    })
    assert blocked.status_code == 409
