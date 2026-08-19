from datetime import datetime, date
from models import db

class HabitRecord(db.Model):
    __tablename__ = "habit_records"
    __table_args__ = (
        db.UniqueConstraint("habit_id", "completed_date", name="uq_habit_record_date"),
    )

    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey("habits.id", ondelete="CASCADE"), nullable=False, index=True)
    completed_date = db.Column(db.Date, nullable=False, default=date.today, index=True)
    completed = db.Column(db.Boolean, default=True, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "habit_id": self.habit_id,
            "completed_date": self.completed_date.isoformat() if self.completed_date else None,
            "completed": self.completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
