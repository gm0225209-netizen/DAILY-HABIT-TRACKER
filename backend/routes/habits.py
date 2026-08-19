from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from models import db, Habit, HabitRecord
from services.streak_service import StreakService
from services.achievement_service import AchievementService
from utils.helpers import success_response, error_response
from utils.validators import validate_date

habits_bp = Blueprint("habits", __name__, url_prefix="/api/habits")

@habits_bp.route("", methods=["POST"])
@jwt_required()
def create_habit():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    if not name:
        return error_response("Habit name is required", status_code=400)

    category = data.get("category", "General").strip() or "General"
    frequency = data.get("frequency", "daily").strip() or "daily"
    priority = data.get("priority", "Medium").strip() or "Medium"
    color = data.get("color", "#3B82F6").strip() or "#3B82F6"
    icon = data.get("icon", "CheckCircle2").strip() or "CheckCircle2"
    reminder_time = data.get("reminder_time", "").strip() or None
    description = data.get("description", "").strip() or None

    try:
        target = int(data.get("target", 1))
        if target < 1:
            target = 1
    except (ValueError, TypeError):
        target = 1

    start_date_val = validate_date(data.get("start_date")) or date.today()

    habit = Habit(
        user_id=user_id,
        name=name,
        description=description,
        category=category,
        frequency=frequency,
        target=target,
        start_date=start_date_val,
        reminder_time=reminder_time,
        priority=priority,
        status="active",
        color=color,
        icon=icon,
    )
    db.session.add(habit)
    db.session.commit()

    AchievementService.check_and_unlock_achievements(user_id)

    return success_response(
        data=habit.to_dict(),
        message="Habit created successfully",
        status_code=201,
    )

@habits_bp.route("", methods=["GET"])
@jwt_required()
def get_habits():
    user_id = int(get_jwt_identity())
    category = request.args.get("category")
    status = request.args.get("status")
    priority = request.args.get("priority")
    search = request.args.get("search")

    query = Habit.query.filter_by(user_id=user_id)

    if status:
        query = query.filter_by(status=status)
    if category and category != "All":
        query = query.filter_by(category=category)
    if priority and priority != "All":
        query = query.filter_by(priority=priority)
    if search:
        query = query.filter(Habit.name.ilike(f"%{search.strip()}%"))

    habits = query.order_by(Habit.created_at.desc()).all()

    today = date.today()
    result = []
    for h in habits:
        h_dict = h.to_dict()
        streak_data = StreakService.calculate_habit_streak(h.id)
        h_dict["streak"] = streak_data
        
        today_record = HabitRecord.query.filter_by(habit_id=h.id, completed_date=today, completed=True).first()
        h_dict["completed_today"] = bool(today_record)
        result.append(h_dict)

    return success_response(data=result, message="Habits retrieved successfully")

@habits_bp.route("/<int:habit_id>", methods=["GET"])
@jwt_required()
def get_habit(habit_id):
    user_id = int(get_jwt_identity())
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return error_response("Habit not found", status_code=404)

    h_dict = habit.to_dict()
    h_dict["streak"] = StreakService.calculate_habit_streak(habit.id)

    records = (
        HabitRecord.query.filter_by(habit_id=habit.id)
        .order_by(HabitRecord.completed_date.desc())
        .limit(30)
        .all()
    )
    h_dict["recent_records"] = [r.to_dict() for r in records]

    return success_response(data=h_dict, message="Habit details retrieved")

@habits_bp.route("/<int:habit_id>", methods=["PUT"])
@jwt_required()
def update_habit(habit_id):
    user_id = int(get_jwt_identity())
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return error_response("Habit not found", status_code=404)

    data = request.get_json() or {}
    if "name" in data:
        name = data["name"].strip()
        if not name:
            return error_response("Habit name cannot be empty", status_code=400)
        habit.name = name

    if "description" in data:
        habit.description = data["description"].strip() if data["description"] else None
    if "category" in data:
        habit.category = data["category"].strip() or habit.category
    if "frequency" in data:
        habit.frequency = data["frequency"].strip() or habit.frequency
    if "priority" in data:
        habit.priority = data["priority"].strip() or habit.priority
    if "color" in data:
        habit.color = data["color"].strip() or habit.color
    if "icon" in data:
        habit.icon = data["icon"].strip() or habit.icon
    if "reminder_time" in data:
        habit.reminder_time = data["reminder_time"].strip() if data["reminder_time"] else None
    if "target" in data:
        try:
            habit.target = max(1, int(data["target"]))
        except (ValueError, TypeError):
            pass
    if "status" in data and data["status"] in ["active", "paused", "archived"]:
        habit.status = data["status"]

    db.session.commit()
    return success_response(data=habit.to_dict(), message="Habit updated successfully")

@habits_bp.route("/<int:habit_id>", methods=["DELETE"])
@jwt_required()
def delete_habit(habit_id):
    user_id = int(get_jwt_identity())
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return error_response("Habit not found", status_code=404)

    db.session.delete(habit)
    db.session.commit()
    return success_response(message="Habit deleted successfully")

@habits_bp.route("/<int:habit_id>/status", methods=["PATCH"])
@jwt_required()
def update_habit_status(habit_id):
    user_id = int(get_jwt_identity())
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return error_response("Habit not found", status_code=404)

    data = request.get_json() or {}
    new_status = data.get("status")
    if new_status not in ["active", "paused", "archived"]:
        return error_response("Invalid status. Must be active, paused, or archived", status_code=400)

    habit.status = new_status
    db.session.commit()
    return success_response(data=habit.to_dict(), message=f"Habit status updated to {new_status}")
