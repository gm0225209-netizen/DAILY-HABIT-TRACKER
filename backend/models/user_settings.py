from datetime import datetime
from models import db

class UserSettings(db.Model):
    __tablename__ = "user_settings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    theme = db.Column(db.String(20), default="dark", nullable=False)
    notification_enabled = db.Column(db.Boolean, default=True, nullable=False)
    reminder_enabled = db.Column(db.Boolean, default=True, nullable=False)
    time_format = db.Column(db.String(10), default="12h", nullable=False)
    date_format = db.Column(db.String(20), default="YYYY-MM-DD", nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "theme": self.theme,
            "notification_enabled": self.notification_enabled,
            "reminder_enabled": self.reminder_enabled,
            "time_format": self.time_format,
            "date_format": self.date_format,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
