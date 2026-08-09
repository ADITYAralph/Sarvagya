import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

class TestSarvagyaBranding(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_fastapi_title(self):
        self.assertEqual(app.title, "Sarvagya AI Engine API")
        print("[OK] Verified FastAPI Title: Sarvagya AI Engine API")

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["app"], "Sarvagya AI Engine API")
        print("[OK] Verified Root Endpoint App Name: Sarvagya AI Engine API")

    def test_database_url_setting(self):
        self.assertIn("sarvagya.db", settings.DATABASE_URL)
        print("[OK] Verified Database URL:", settings.DATABASE_URL)

    def test_openapi_schema(self):
        response = self.client.get("/openapi.json")
        self.assertEqual(response.status_code, 200)
        schema = response.json()
        self.assertEqual(schema["info"]["title"], "Sarvagya AI Engine API")
        print("[OK] Verified OpenAPI Title: Sarvagya AI Engine API")

if __name__ == "__main__":
    unittest.main()
