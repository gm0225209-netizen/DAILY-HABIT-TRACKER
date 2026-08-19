from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Achievement
from services.achievement_service import AchievementService
from utils.helpers import success_response

achievements_bp = Blueprint("achievements", __name__, url_prefix="/api/achievements")

@achievements_bp.route("", methods=["GET"])
@jwt_required()
def get_all_achievements():
    user_id = int(get_jwt_identity())
    
    AchievementService.check_and_unlock_achievements(user_id)

    earned = {a.badge: a for a in Achievement.query.filter_by(user_id=user_id).all()}
    available = AchievementService.get_all_available()

    result = []
    for item in available:
        b_code = item["badge"]
        is_unlocked = b_code in earned
        result.append({
            **item,
            "unlocked": is_unlocked,
            "earned_at": earned[b_code].earned_at.isoformat() if is_unlocked else None,
        })

    unlocked_count = sum(1 for a in result if a["unlocked"])
    total_count = len(result)
    progress_pct = round((unlocked_count / total_count) * 100, 1) if total_count > 0 else 0

    return success_response(
        data={
            "achievements": result,
            "unlocked_count": unlocked_count,
            "total_count": total_count,
            "progress_percentage": progress_pct,
        },
        message="Achievements retrieved",
    )

@achievements_bp.route("/user", methods=["GET"])
@jwt_required()
def get_user_earned_achievements():
    user_id = int(get_jwt_identity())
    achievements = Achievement.query.filter_by(user_id=user_id).order_by(Achievement.earned_at.desc()).all()
    return success_response(data=[a.to_dict() for a in achievements], message="User achievements retrieved")
