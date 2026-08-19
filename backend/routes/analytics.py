from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.analytics_service import AnalyticsService
from utils.helpers import success_response

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("/weekly", methods=["GET"])
@jwt_required()
def get_weekly():
    user_id = int(get_jwt_identity())
    data = AnalyticsService.get_weekly_analytics(user_id)
    return success_response(data=data, message="Weekly analytics retrieved")

@analytics_bp.route("/monthly", methods=["GET"])
@jwt_required()
def get_monthly():
    user_id = int(get_jwt_identity())
    data = AnalyticsService.get_monthly_analytics(user_id)
    return success_response(data=data, message="Monthly analytics retrieved")

@analytics_bp.route("/habits", methods=["GET"])
@jwt_required()
def get_habits_analytics():
    user_id = int(get_jwt_identity())
    data = AnalyticsService.get_habit_comparison(user_id)
    return success_response(data=data, message="Habit comparison analytics retrieved")
