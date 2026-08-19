from datetime import datetime, date
from models import db, Notification, Habit, HabitRecord

class NotificationService:
    @staticmethod
    def get_user_notifications(user_id: int) -> list[dict]:
        notifs = (
            Notification.query.filter_by(user_id=user_id)
            .order_by(Notification.created_at.desc())
            .limit(30)
            .all()
        )
        return [n.to_dict() for n in notifs]

    @staticmethod
    def get_unread_count(user_id: int) -> int:
        return Notification.query.filter_by(user_id=user_id, is_read=False).count()

    @staticmethod
    def create_reminder_notifications_if_needed(user_id: int):
        today = date.today()
        active_habits = Habit.query.filter_by(user_id=user_id, status="active").all()
        
        for h in active_habits:
            if not h.reminder_time:
                continue

            record = HabitRecord.query.filter_by(habit_id=h.id, completed_date=today, completed=True).first()
            if record:
                continue

            today_start = datetime.combine(today, datetime.min.time())
            existing = Notification.query.filter(
                Notification.user_id == user_id,
                Notification.habit_id == h.id,
                Notification.type == "reminder",
                Notification.created_at >= today_start
            ).first()

            if not existing:
                notif = Notification(
                    user_id=user_id,
                    habit_id=h.id,
                    message=f"⏰ Daily Reminder: Time to complete '{h.name}' ({h.reminder_time})!",
                    scheduled_time=h.reminder_time,
                    type="reminder",
                    is_read=False
                )
                db.session.add(notif)

        db.session.commit()
