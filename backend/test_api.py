"""
GlucoCare AI — Automated API & ML Pipeline Unit Tests
Run with: pytest backend/test_api.py
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app

class TestGlucoCareAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("service", data)

    def test_model_info_endpoint(self):
        response = self.client.get("/api/model-info")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("dataset_info", data)
        self.assertIn("models", data)

    def test_valid_prediction(self):
        payload = {
            "inputs": {
                "pregnancies": 2,
                "glucose": 135.0,
                "blood_pressure": 80.0,
                "skin_thickness": 28.0,
                "insulin": 110.0,
                "bmi": 29.5,
                "diabetes_pedigree": 0.45,
                "age": 42
            },
            "modelType": "logistic_regression"
        }
        response = self.client.post("/api/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("riskScore", data)
        self.assertIn("classificationLabel", data)
        self.assertIn("featureImpacts", data)
        self.assertIn("lifestyleRecommendations", data)
        self.assertTrue(0 <= data["riskScore"] <= 100)

    def test_invalid_glucose_rejected(self):
        # Glucose below physiological minimum (40 mg/dL)
        payload = {
            "inputs": {
                "pregnancies": 1,
                "glucose": 10.0,
                "blood_pressure": 70.0,
                "skin_thickness": 20.0,
                "insulin": 80.0,
                "bmi": 24.0,
                "diabetes_pedigree": 0.3,
                "age": 30
            }
        }
        response = self.client.post("/api/predict", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_invalid_bmi_rejected(self):
        payload = {
            "inputs": {
                "pregnancies": 0,
                "glucose": 100.0,
                "blood_pressure": 70.0,
                "skin_thickness": 20.0,
                "insulin": 80.0,
                "bmi": 150.0, # Impossible BMI
                "diabetes_pedigree": 0.3,
                "age": 30
            }
        }
        response = self.client.post("/api/predict", json=payload)
        self.assertEqual(response.status_code, 422)

if __name__ == "__main__":
    unittest.main()
