from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Habit
from services.streak_service import StreakService
from utils.helpers import success_response, error_response

streaks_bp = Blueprint("streaks", __name__, url_prefix="/api/streaks")

@streaks_bp.route("", methods=["GET"])
@jwt_required()
def get_user_streaks():
    user_id = int(get_jwt_identity())
    data = StreakService.calculate_user_streaks(user_id)
    return success_response(data=data, message="Streaks retrieved successfully")

@streaks_bp.route("/<int:habit_id>", methods=["GET"])
@jwt_required()
def get_habit_streak(habit_id):
    user_id = int(get_jwt_identity())
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return error_response("Habit not found", status_code=404)

    data = StreakService.calculate_habit_streak(habit.id)
    return success_response(data={
        "habit_id": habit.id,
        "habit_name": habit.name,
        **data
    }, message="Habit streak retrieved")
