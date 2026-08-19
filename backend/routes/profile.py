from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, UserSettings, Habit, HabitRecord, Achievement
from utils.helpers import success_response, error_response
from utils.validators import validate_email

profile_bp = Blueprint("profile", __name__, url_prefix="/api")

@profile_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", status_code=404)

    total_habits = Habit.query.filter_by(user_id=user_id).count()
    active_habits = Habit.query.filter_by(user_id=user_id, status="active").count()
    
    habit_ids = [h.id for h in Habit.query.filter_by(user_id=user_id).all()]
    total_completions = HabitRecord.query.filter(
        HabitRecord.habit_id.in_(habit_ids),
        HabitRecord.completed == True
    ).count() if habit_ids else 0

    total_achievements = Achievement.query.filter_by(user_id=user_id).count()

    return success_response(
        data={
            "user": user.to_dict(),
            "stats": {
                "total_habits": total_habits,
                "active_habits": active_habits,
                "total_completions": total_completions,
                "earned_badges": total_achievements,
            }
        },
        message="Profile retrieved",
    )

@profile_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", status_code=404)

    data = request.get_json() or {}
    if "name" in data:
        name = data["name"].strip()
        if not name:
            return error_response("Name cannot be empty", status_code=400)
        user.name = name

    if "email" in data:
        email = data["email"].strip().lower()
        if not validate_email(email):
            return error_response("Invalid email format", status_code=400)
        existing = User.query.filter(User.email == email, User.id != user_id).first()
        if existing:
            return error_response("Email already in use", status_code=409)
        user.email = email

    if "avatar" in data:
        user.avatar = data["avatar"].strip() if data["avatar"] else None

    if "password" in data and data["password"]:
        if len(data["password"]) < 6:
            return error_response("Password must be at least 6 characters", status_code=400)
        user.set_password(data["password"])

    db.session.commit()
    return success_response(data=user.to_dict(), message="Profile updated successfully")

@profile_bp.route("/settings", methods=["GET"])
@jwt_required()
def get_settings():
    user_id = int(get_jwt_identity())
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)
        db.session.commit()

    return success_response(data=settings.to_dict(), message="Settings retrieved")

@profile_bp.route("/settings", methods=["PUT"])
@jwt_required()
def update_settings():
    user_id = int(get_jwt_identity())
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)

    data = request.get_json() or {}
    if "theme" in data and data["theme"] in ["dark", "light", "system"]:
        settings.theme = data["theme"]
    if "notification_enabled" in data:
        settings.notification_enabled = bool(data["notification_enabled"])
    if "reminder_enabled" in data:
        settings.reminder_enabled = bool(data["reminder_enabled"])
    if "time_format" in data and data["time_format"] in ["12h", "24h"]:
        settings.time_format = data["time_format"]
    if "date_format" in data:
        settings.date_format = data["date_format"].strip() or settings.date_format

    db.session.commit()
    return success_response(data=settings.to_dict(), message="Settings updated successfully")
