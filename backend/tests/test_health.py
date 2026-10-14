from fastapi.testclient import TestClient

from app.main import app


def test_health():
    with TestClient(app) as client:
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"


def test_openapi_lists_core_routes():
    paths = app.openapi()["paths"]
    for route in ("/api/v1/auth/login", "/api/v1/content/services", "/api/v1/forms/contact"):
        assert route in paths
