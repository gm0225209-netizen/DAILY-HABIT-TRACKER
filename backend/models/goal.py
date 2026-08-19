from datetime import datetime, date
from models import db

class Goal(db.Model):
    __tablename__ = "goals"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target = db.Column(db.Float, default=100.0, nullable=False)
    progress = db.Column(db.Float, default=0.0, nullable=False)
    unit = db.Column(db.String(50), default="days", nullable=False)
    category = db.Column(db.String(50), default="General", nullable=False)
    start_date = db.Column(db.Date, default=date.today, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), default="in_progress", nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def percentage(self):
        if self.target <= 0:
            return 0.0
        pct = (self.progress / self.target) * 100.0
        return min(round(pct, 1), 100.0)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "target": self.target,
            "progress": self.progress,
            "percentage": self.percentage,
            "unit": self.unit,
            "category": self.category,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
