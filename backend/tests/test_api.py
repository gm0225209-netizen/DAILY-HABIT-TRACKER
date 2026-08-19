import os
import sys
import unittest
from datetime import date, timedelta

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from models import db, User, Habit, HabitRecord, Goal, Achievement, UserSettings
from config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-jwt-secret-key-123"

class HabitTrackerTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

        # Helper: register test user and get token
        resp = self.client.post("/api/auth/register", json={
            "name": "Test User",
            "email": "tester@example.com",
            "password": "password123"
        })
        self.assertEqual(resp.status_code, 201)
        data = resp.get_json()["data"]
        self.token = data["token"]
        self.user_id = data["user"]["id"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_auth_duplicate_email(self):
        resp = self.client.post("/api/auth/register", json={
            "name": "Another User",
            "email": "tester@example.com",
            "password": "password123"
        })
        self.assertEqual(resp.status_code, 409)

    def test_auth_login(self):
        resp = self.client.post("/api/auth/login", json={
            "email": "tester@example.com",
            "password": "password123"
        })
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.get_json()["success"])
        self.assertIn("token", resp.get_json()["data"])

    def test_habit_crud_and_tracking(self):
        # 1. Create Habit
        resp = self.client.post("/api/habits", headers=self.headers, json={
            "name": "Read 10 pages",
            "description": "Daily reading",
            "category": "Learning",
            "frequency": "daily",
            "target": 1,
            "priority": "High",
            "color": "#10B981",
            "icon": "BookOpen"
        })
        self.assertEqual(resp.status_code, 201)
        habit_id = resp.get_json()["data"]["id"]

        # 2. List Habits
        resp = self.client.get("/api/habits", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        habits = resp.get_json()["data"]
        self.assertEqual(len(habits), 1)

        # 3. Track Habit (Check-in for today)
        today = date.today().isoformat()
        resp = self.client.post("/api/tracking", headers=self.headers, json={
            "habit_id": habit_id,
            "date": today,
            "completed": True
        })
        self.assertEqual(resp.status_code, 200)
        track_data = resp.get_json()["data"]
        self.assertTrue(track_data["completed"])
        self.assertEqual(track_data["streak"]["current_streak"], 1)

        # 4. Check Dashboard
        resp = self.client.get("/api/dashboard", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        dash_data = resp.get_json()["data"]
        self.assertEqual(dash_data["stats"]["total_habits"], 1)
        self.assertEqual(dash_data["stats"]["completed_habits"], 1)
        self.assertEqual(dash_data["stats"]["completion_percentage"], 100.0)

    def test_goals_and_achievements(self):
        # Create Goal
        resp = self.client.post("/api/goals", headers=self.headers, json={
            "title": "Meditate 10 sessions",
            "target": 10.0,
            "progress": 2.0,
            "unit": "sessions",
            "category": "Mindfulness"
        })
        self.assertEqual(resp.status_code, 201)
        goal_id = resp.get_json()["data"]["id"]

        # Update Goal Progress
        resp = self.client.patch(f"/api/goals/{goal_id}/progress", headers=self.headers, json={
            "value": 10.0
        })
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.get_json()["data"]["status"], "completed")

        # Check Achievements
        resp = self.client.get("/api/achievements", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        ach_data = resp.get_json()["data"]
        self.assertGreaterEqual(ach_data["unlocked_count"], 1)

    def test_analytics_and_insights(self):
        resp = self.client.get("/api/analytics/weekly", headers=self.headers)
        self.assertEqual(resp.status_code, 200)

        resp = self.client.get("/api/insights", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.get_json()["data"], list)

if __name__ == "__main__":
    unittest.main()
