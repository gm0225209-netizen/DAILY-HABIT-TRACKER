from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from models import db, Goal
from services.achievement_service import AchievementService
from utils.helpers import success_response, error_response
from utils.validators import validate_date

goals_bp = Blueprint("goals", __name__, url_prefix="/api/goals")

@goals_bp.route("", methods=["GET"])
@jwt_required()
def get_goals():
    user_id = int(get_jwt_identity())
    status = request.args.get("status")
    
    query = Goal.query.filter_by(user_id=user_id)
    if status and status != "all":
        query = query.filter_by(status=status)

    goals = query.order_by(Goal.created_at.desc()).all()
    return success_response(data=[g.to_dict() for g in goals], message="Goals retrieved")

@goals_bp.route("", methods=["POST"])
@jwt_required()
def create_goal():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get("title", "").strip()
    if not title:
        return error_response("Goal title is required", status_code=400)

    try:
        target = float(data.get("target", 100.0))
        if target <= 0:
            target = 1.0
    except (ValueError, TypeError):
        target = 100.0

    try:
        progress = float(data.get("progress", 0.0))
    except (ValueError, TypeError):
        progress = 0.0

    unit = data.get("unit", "days").strip() or "days"
    category = data.get("category", "General").strip() or "General"
    description = data.get("description", "").strip() or None
    start_date_val = validate_date(data.get("start_date")) or date.today()
    end_date_val = validate_date(data.get("end_date"))

    status = "completed" if progress >= target else "in_progress"

    goal = Goal(
        user_id=user_id,
        title=title,
        description=description,
        target=target,
        progress=progress,
        unit=unit,
        category=category,
        start_date=start_date_val,
        end_date=end_date_val,
        status=status,
    )
    db.session.add(goal)
    db.session.commit()

    if status == "completed":
        AchievementService.check_and_unlock_achievements(user_id)

    return success_response(data=goal.to_dict(), message="Goal created successfully", status_code=201)

@goals_bp.route("/<int:goal_id>", methods=["GET"])
@jwt_required()
def get_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error_response("Goal not found", status_code=404)
    return success_response(data=goal.to_dict(), message="Goal details retrieved")

@goals_bp.route("/<int:goal_id>", methods=["PUT"])
@jwt_required()
def update_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error_response("Goal not found", status_code=404)

    data = request.get_json() or {}
    if "title" in data:
        t = data["title"].strip()
        if not t:
            return error_response("Goal title cannot be empty", status_code=400)
        goal.title = t

    if "description" in data:
        goal.description = data["description"].strip() if data["description"] else None
    if "category" in data:
        goal.category = data["category"].strip() or goal.category
    if "unit" in data:
        goal.unit = data["unit"].strip() or goal.unit
    if "target" in data:
        try:
            goal.target = max(1.0, float(data["target"]))
        except (ValueError, TypeError):
            pass
    if "progress" in data:
        try:
            goal.progress = max(0.0, float(data["progress"]))
        except (ValueError, TypeError):
            pass
    if "end_date" in data:
        goal.end_date = validate_date(data["end_date"])
    if "status" in data and data["status"] in ["in_progress", "completed", "paused"]:
        goal.status = data["status"]

    if goal.progress >= goal.target and goal.status == "in_progress":
        goal.status = "completed"

    db.session.commit()

    if goal.status == "completed":
        AchievementService.check_and_unlock_achievements(user_id)

    return success_response(data=goal.to_dict(), message="Goal updated successfully")

@goals_bp.route("/<int:goal_id>/progress", methods=["PATCH"])
@jwt_required()
def update_goal_progress(goal_id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error_response("Goal not found", status_code=404)

    data = request.get_json() or {}
    delta = data.get("delta")
    set_value = data.get("value")

    if delta is not None:
        try:
            goal.progress = max(0.0, goal.progress + float(delta))
        except (ValueError, TypeError):
            pass
    elif set_value is not None:
        try:
            goal.progress = max(0.0, float(set_value))
        except (ValueError, TypeError):
            pass

    if goal.progress >= goal.target:
        goal.status = "completed"
        AchievementService.check_and_unlock_achievements(user_id)
    elif goal.status == "completed" and goal.progress < goal.target:
        goal.status = "in_progress"

    db.session.commit()
    return success_response(data=goal.to_dict(), message="Goal progress updated")

@goals_bp.route("/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error_response("Goal not found", status_code=404)

    db.session.delete(goal)
    db.session.commit()
    return success_response(message="Goal deleted successfully")
