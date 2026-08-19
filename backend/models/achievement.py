from datetime import datetime
from models import db

class Achievement(db.Model):
    __tablename__ = "achievements"
    __table_args__ = (
        db.UniqueConstraint("user_id", "badge", name="uq_user_badge"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    badge = db.Column(db.String(50), nullable=False)
    icon = db.Column(db.String(50), default="Award", nullable=False)
    category = db.Column(db.String(50), default="Streak", nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "badge": self.badge,
            "icon": self.icon,
            "category": self.category,
            "earned_at": self.earned_at.isoformat() if self.earned_at else None,
        }
