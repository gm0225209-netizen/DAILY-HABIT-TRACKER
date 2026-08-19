from datetime import datetime
from models import db

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    habit_id = db.Column(db.Integer, db.ForeignKey("habits.id", ondelete="SET NULL"), nullable=True)

    message = db.Column(db.Text, nullable=False)
    scheduled_time = db.Column(db.String(50), nullable=True)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    type = db.Column(db.String(50), default="reminder", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "habit_id": self.habit_id,
            "message": self.message,
            "scheduled_time": self.scheduled_time,
            "is_read": self.is_read,
            "type": self.type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
