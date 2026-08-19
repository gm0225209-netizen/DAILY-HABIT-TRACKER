from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from models import db, User, Habit, HabitRecord, Goal, Achievement, Notification
from services.streak_service import StreakService
from services.analytics_service import AnalyticsService
from services.progress_service import ProgressService
from services.notification_service import NotificationService
from utils.helpers import success_response, error_response

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("", methods=["GET"])
@jwt_required()
def get_dashboard_data():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", status_code=404)

    NotificationService.create_reminder_notifications_if_needed(user_id)

    today = date.today()
    today_progress = ProgressService.get_today_progress(user_id)
    streak_data = StreakService.calculate_user_streaks(user_id)
    weekly_analytics = AnalyticsService.get_weekly_analytics(user_id)

    active_habits = Habit.query.filter_by(user_id=user_id, status="active").order_by(Habit.priority.asc(), Habit.created_at.asc()).all()
    habit_ids = [h.id for h in active_habits]

    today_records = HabitRecord.query.filter(
        HabitRecord.habit_id.in_(habit_ids),
        HabitRecord.completed_date == today,
        HabitRecord.completed == True
    ).all() if habit_ids else []

    completed_ids = {r.habit_id for r in today_records}

    today_habits_list = []
    for h in active_habits:
        s = StreakService.calculate_habit_streak(h.id)
        today_habits_list.append({
            "id": h.id,
            "name": h.name,
            "category": h.category,
            "priority": h.priority,
            "color": h.color,
            "icon": h.icon,
            "reminder_time": h.reminder_time,
            "completed": h.id in completed_ids,
            "current_streak": s["current_streak"],
            "target": h.target,
        })

    recent_achievements = (
        Achievement.query.filter_by(user_id=user_id)
        .order_by(Achievement.earned_at.desc())
        .limit(4)
        .all()
    )

    active_goals = (
        Goal.query.filter_by(user_id=user_id, status="in_progress")
        .order_by(Goal.created_at.desc())
        .limit(3)
        .all()
    )

    unread_notifs = NotificationService.get_unread_count(user_id)

    return success_response(
        data={
            "user": user.to_dict(),
            "today_date": today.isoformat(),
            "today_date_formatted": today.strftime("%A, %B %d, %Y"),
            "stats": {
                "total_habits": today_progress["total_habits"],
                "completed_habits": today_progress["completed_habits"],
                "pending_habits": today_progress["pending_habits"],
                "completion_percentage": today_progress["completion_percentage"],
                "current_streak": streak_data["max_current_streak"],
                "longest_streak": streak_data["max_longest_streak"],
                "weekly_rate": weekly_analytics["weekly_rate"],
            },
            "today_habits": today_habits_list,
            "weekly_progress": weekly_analytics["daily_trends"],
            "recent_achievements": [a.to_dict() for a in recent_achievements],
            "active_goals": [g.to_dict() for g in active_goals],
            "unread_notifications": unread_notifs,
        },
        message="Dashboard data retrieved successfully",
    )
