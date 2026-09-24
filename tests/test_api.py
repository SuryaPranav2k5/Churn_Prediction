import unittest
import json
import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app

class TestChurnLensAPI(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_health_endpoint(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'ok')
        self.assertTrue(data['dataset_available'])
        self.assertFalse(data['model_available'])
        self.assertEqual(data['mode'], 'demo')

    def test_meta_endpoint(self):
        response = self.client.get('/api/meta')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['project_name'], 'ChurnLens')
        self.assertIn('SAFE_DISPLAY_FIELDS', [k.upper() for k in data.keys()])

    def test_summary_endpoint(self):
        response = self.client.get('/api/summary')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['total_customers'], 7043)
        self.assertEqual(data['actual_churned'], 1869)
        self.assertEqual(data['actual_non_churned'], 5174)
        self.assertAlmostEqual(data['actual_churn_rate'], 0.2654, places=2)
        self.assertIsNone(data['predicted_risk_counts'])

    def test_customers_pagination(self):
        response = self.client.get('/api/customers?page=1&page_size=10')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['total'], 7043)
        self.assertEqual(len(data['customers']), 10)
        # Check that predictions are null in demo mode
        self.assertIsNone(data['customers'][0]['churn_probability'])
        self.assertIsNone(data['customers'][0]['risk_band'])

    def test_customer_detail_found(self):
        response = self.client.get('/api/customers/7590-VHVEG')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['customerID'], '7590-VHVEG')

    def test_customer_detail_not_found(self):
        response = self.client.get('/api/customers/NON-EXISTENT-ID')
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn('error', data)

    def test_customer_explanation_demo_mode(self):
        response = self.client.get('/api/customers/7590-VHVEG/explanation')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertFalse(data['available'])
        self.assertEqual(data['mode'], 'demo')
        self.assertIn('Demo mode', data['message'])

    def test_predict_rejects_leakage_and_target_fields(self):
        payload = {"Churn": "Yes", "tenure": 12}
        response = self.client.post('/api/predict', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('Prohibited fields', data['error'])

    def test_predict_demo_mode_returns_503(self):
        payload = {"tenure": 12, "Contract": "Month-to-month", "MonthlyCharges": 70.0}
        response = self.client.post('/api/predict', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 503)
        data = response.get_json()
        self.assertIn('AI model unavailable', data['error'])

if __name__ == '__main__':
    unittest.main()
