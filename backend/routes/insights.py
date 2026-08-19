from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.insight_service import InsightService
from utils.helpers import success_response

insights_bp = Blueprint("insights", __name__, url_prefix="/api/insights")

@insights_bp.route("", methods=["GET"])
@jwt_required()
def get_insights():
    user_id = int(get_jwt_identity())
    insights = InsightService.generate_insights(user_id)
    return success_response(data=insights, message="Insights generated successfully")
