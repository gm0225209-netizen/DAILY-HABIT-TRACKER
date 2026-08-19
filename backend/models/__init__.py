from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from models.user import User
from models.habit import Habit
from models.habit_record import HabitRecord
from models.goal import Goal
from models.achievement import Achievement
from models.notification import Notification
from models.user_settings import UserSettings

__all__ = [
    "db",
    "User",
    "Habit",
    "HabitRecord",
    "Goal",
    "Achievement",
    "Notification",
    "UserSettings",
]
