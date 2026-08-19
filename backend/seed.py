import os
import sys
from datetime import date, datetime, timedelta
import random

# Add parent directory to path to allow direct execution
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from models import db, User, Habit, HabitRecord, Goal, Achievement, Notification, UserSettings
from services.streak_service import StreakService
from services.achievement_service import AchievementService

def seed_demo_user(force=False):
    """Seed the demo user and 28 days of realistic habit tracking data if needed."""
    demo_user = User.query.filter_by(email="demo@habittracker.io").first()
    if demo_user and not force:
        return demo_user

    if demo_user and force:
        print("[*] Cleaning up existing demo data...")
        db.session.delete(demo_user)
        db.session.commit()

    print("[*] Seeding demo user and 28-day sample data...")
    # 1. Create Demo User
    user = User(
        name="Alex Morgan",
        email="demo@habittracker.io",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    )
    user.set_password("password123")
    db.session.add(user)
    db.session.flush()

    # 2. Create User Settings
    settings = UserSettings(
        user_id=user.id,
        theme="dark",
        notification_enabled=True,
        reminder_enabled=True,
        time_format="12h",
        date_format="YYYY-MM-DD"
    )
    db.session.add(settings)

    # 3. Create Diverse Habits
    habits_data = [
        {
            "name": "Morning Workout & Stretching",
            "description": "30 minutes of cardio, HIIT or yoga stretching",
            "category": "Fitness",
            "frequency": "daily",
            "target": 1,
            "priority": "High",
            "color": "#3B82F6",
            "icon": "Dumbbell",
            "reminder_time": "07:00",
            "completion_prob": 0.90,
        },
        {
            "name": "Read 25 Pages of Non-Fiction",
            "description": "Deep reading on software architecture or psychology",
            "category": "Learning",
            "frequency": "daily",
            "target": 1,
            "priority": "Medium",
            "color": "#10B981",
            "icon": "BookOpen",
            "reminder_time": "21:30",
            "completion_prob": 0.85,
        },
        {
            "name": "Drink 3 Liters of Water",
            "description": "Hydrate consistently throughout the day",
            "category": "Health",
            "frequency": "daily",
            "target": 1,
            "priority": "High",
            "color": "#06B6D4",
            "icon": "Droplets",
            "reminder_time": "10:00",
            "completion_prob": 0.95,
        },
        {
            "name": "10-Minute Mindfulness Meditation",
            "description": "Box breathing and focus meditation",
            "category": "Mindfulness",
            "frequency": "daily",
            "target": 1,
            "priority": "Medium",
            "color": "#8B5CF6",
            "icon": "Brain",
            "reminder_time": "08:00",
            "completion_prob": 0.80,
        },
        {
            "name": "Daily Code & Algorithms Practice",
            "description": "Solve 1 algorithm problem or build project features",
            "category": "Productivity",
            "frequency": "daily",
            "target": 1,
            "priority": "High",
            "color": "#F59E0B",
            "icon": "Code2",
            "reminder_time": "18:00",
            "completion_prob": 0.88,
        },
        {
            "name": "Expense Logging & Budget Review",
            "description": "Track daily receipts and financial balance",
            "category": "Finance",
            "frequency": "daily",
            "target": 1,
            "priority": "Low",
            "color": "#EC4899",
            "icon": "Wallet",
            "reminder_time": "20:00",
            "completion_prob": 0.70,
        }
    ]

    created_habits = []
    today = date.today()

    for h_info in habits_data:
        prob = h_info.pop("completion_prob")
        habit = Habit(
            user_id=user.id,
            start_date=today - timedelta(days=28),
            status="active",
            **h_info
        )
        db.session.add(habit)
        db.session.flush()
        created_habits.append((habit, prob))

    # 4. Generate Realistic 28-day Habit Records
    random.seed(42)  # Deterministic seed for reproducible rich demo data
    for habit, prob in created_habits:
        for day_offset in range(28, -1, -1):
            cur_date = today - timedelta(days=day_offset)
            if day_offset <= 7:
                is_completed = random.random() < 0.92
            else:
                is_completed = random.random() < prob

            if is_completed:
                record = HabitRecord(
                    habit_id=habit.id,
                    completed_date=cur_date,
                    completed=True,
                    completed_at=datetime.combine(cur_date, datetime.min.time()) + timedelta(hours=random.randint(7, 21), minutes=random.randint(5, 55))
                )
                db.session.add(record)

    # 5. Create Goals
    goals_data = [
        {
            "title": "Complete 30-Day Fitness Consistency Challenge",
            "description": "Hit at least 25 workouts this month without missing 2 consecutive days",
            "target": 30.0,
            "progress": 24.0,
            "unit": "days",
            "category": "Fitness",
            "start_date": today - timedelta(days=24),
            "end_date": today + timedelta(days=6),
            "status": "in_progress",
        },
        {
            "title": "Finish 4 Non-Fiction Books",
            "description": "System Design, Atomic Habits, Clean Architecture, Deep Work",
            "target": 4.0,
            "progress": 3.0,
            "unit": "books",
            "category": "Learning",
            "start_date": today - timedelta(days=30),
            "end_date": today + timedelta(days=15),
            "status": "in_progress",
        },
        {
            "title": "100 Consecutive Days Hydration Master",
            "description": "Maintain 3L daily water habit across 100 straight days",
            "target": 100.0,
            "progress": 100.0,
            "unit": "days",
            "category": "Health",
            "start_date": today - timedelta(days=100),
            "end_date": today,
            "status": "completed",
        },
        {
            "title": "Build and Ship Full-Stack Habit Tracker",
            "description": "Deploy React + Flask + PostgreSQL application with all 15 modules",
            "target": 15.0,
            "progress": 15.0,
            "unit": "modules",
            "category": "Productivity",
            "start_date": today - timedelta(days=7),
            "end_date": today,
            "status": "completed",
        }
    ]

    for g in goals_data:
        goal = Goal(user_id=user.id, **g)
        db.session.add(goal)

    db.session.commit()

    # 6. Unlock Achievements automatically based on data
    AchievementService.check_and_unlock_achievements(user.id)

    # 7. Add demo notifications
    notifs = [
        Notification(
            user_id=user.id,
            message="🚀 Welcome to Daily Habit Tracker! Your streaks and metrics are ready.",
            type="system",
            is_read=True,
            created_at=datetime.utcnow() - timedelta(days=2)
        ),
        Notification(
            user_id=user.id,
            message="🔥 You are on a 7-day streak with 'Morning Workout & Stretching'!",
            type="streak",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=3)
        ),
        Notification(
            user_id=user.id,
            message="⏰ Reminder: Don't forget your 'Daily Code & Algorithms Practice' today.",
            type="reminder",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(minutes=45)
        )
    ]
    db.session.add_all(notifs)
    db.session.commit()

    print("[SUCCESS] Database successfully seeded with demo user!")
    return user

def seed_database():
    from app import create_app
    app = create_app()
    with app.app_context():
        db.create_all()
        seed_demo_user(force=True)

if __name__ == "__main__":
    seed_database()
