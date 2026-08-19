from datetime import datetime, date
from models import db

class Habit(db.Model):
    __tablename__ = "habits"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), default="General", nullable=False)
    frequency = db.Column(db.String(50), default="daily", nullable=False)
    target = db.Column(db.Integer, default=1, nullable=False)
    start_date = db.Column(db.Date, default=date.today, nullable=False)
    reminder_time = db.Column(db.String(10), nullable=True)
    priority = db.Column(db.String(20), default="Medium", nullable=False)
    status = db.Column(db.String(20), default="active", nullable=False)
    color = db.Column(db.String(20), default="#3B82F6", nullable=False)
    icon = db.Column(db.String(50), default="CheckCircle2", nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    records = db.relationship("HabitRecord", backref="habit", cascade="all, delete-orphan", lazy="dynamic")
    notifications = db.relationship("Notification", backref="habit", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "frequency": self.frequency,
            "target": self.target,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "reminder_time": self.reminder_time,
            "priority": self.priority,
            "status": self.status,
            "color": self.color,
            "icon": self.icon,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
