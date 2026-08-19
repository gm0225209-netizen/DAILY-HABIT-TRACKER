from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, timedelta
from models import Habit, HabitRecord
from services.progress_service import ProgressService
from services.streak_service import StreakService
from utils.helpers import success_response, error_response

progress_bp = Blueprint("progress", __name__, url_prefix="/api/progress")

@progress_bp.route("", methods=["GET"])
@jwt_required()
def get_progress_overview():
    user_id = int(get_jwt_identity())
    data = ProgressService.get_overall_progress(user_id)
    return success_response(data=data, message="Progress metrics retrieved")

@progress_bp.route("/<int:habit_id>", methods=["GET"])
@jwt_required()
def get_habit_progress(habit_id):
    user_id = int(get_jwt_identity())
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return error_response("Habit not found", status_code=404)

    today = date.today()
    streak = StreakService.calculate_habit_streak(habit.id)

    all_records = HabitRecord.query.filter_by(habit_id=habit.id, completed=True).all()
    completed_dates = {r.completed_date for r in all_records}

    last_7_done = sum(1 for i in range(7) if (today - timedelta(days=i)) in completed_dates)
    last_30_done = sum(1 for i in range(30) if (today - timedelta(days=i)) in completed_dates)

    rate_7 = round((last_7_done / 7) * 100, 1)
    rate_30 = round((last_30_done / 30) * 100, 1)

    return success_response(
        data={
            "habit": habit.to_dict(),
            "streak": streak,
            "rate_7_days": rate_7,
            "rate_30_days": rate_30,
            "total_completions": len(all_records),
            "completed_today": today in completed_dates,
        },
        message="Habit progress retrieved",
    )
