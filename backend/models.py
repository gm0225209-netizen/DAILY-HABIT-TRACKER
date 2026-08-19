"""
MODULE: models.py
------------------
Defines the three tables the whole app is built on:

    User      -> one row per account
    Habit     -> one row per habit a user tracks (e.g. "Drink water")
    HabitLog  -> one row per day a habit was marked done (the check-ins)

Keeping HabitLog as its own table (instead of a JSON blob on Habit) is
what makes streaks, heatmaps, and history queries possible later.
"""

from datetime import date, datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    habits = db.relationship(
        "Habit", backref="owner", cascade="all, delete-orphan", lazy=True
    )

    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}


class Habit(db.Model):
    __tablename__ = "habits"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    title = db.Column(db.String(120), nullable=False)
    icon = db.Column(db.String(10), default="✅")          # emoji shown on the card
    color = db.Column(db.String(7), default="#2F6F63")     # hex accent color
    frequency = db.Column(db.String(20), default="daily")  # daily | weekdays | custom
    target_days = db.Column(db.String(20), default="1234567")  # ISO weekday digits, e.g. "12345" = Mon-Fri
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    archived = db.Column(db.Boolean, default=False)

    logs = db.relationship(
        "HabitLog", backref="habit", cascade="all, delete-orphan", lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "icon": self.icon,
            "color": self.color,
            "frequency": self.frequency,
            "target_days": self.target_days,
            "archived": self.archived,
            "created_at": self.created_at.isoformat(),
        }


class HabitLog(db.Model):
    __tablename__ = "habit_logs"
    __table_args__ = (
        # a habit can only be checked off ONCE per calendar date
        db.UniqueConstraint("habit_id", "log_date", name="uq_habit_date"),
    )

    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey("habits.id"), nullable=False)
    log_date = db.Column(db.Date, nullable=False, default=date.today)
    note = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "habit_id": self.habit_id,
            "date": self.log_date.isoformat(),
            "note": self.note,
        }
