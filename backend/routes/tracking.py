from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, datetime
from models import db, Habit, HabitRecord
from services.achievement_service import AchievementService
from services.streak_service import StreakService
from services.progress_service import ProgressService
from utils.helpers import success_response, error_response
from utils.validators import validate_date

tracking_bp = Blueprint("tracking", __name__, url_prefix="/api/tracking")

@tracking_bp.route("", methods=["POST"])
@jwt_required()
def toggle_habit_completion():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    habit_id = data.get("habit_id")
    if not habit_id:
        return error_response("Habit ID is required", status_code=400)

    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    if not habit:
        return error_response("Habit not found", status_code=404)

    target_date = validate_date(data.get("date")) or date.today()
    record = HabitRecord.query.filter_by(habit_id=habit.id, completed_date=target_date).first()

    if "completed" in data:
        desired_completed = bool(data["completed"])
    else:
        desired_completed = not record.completed if record else True

    if not record:
        record = HabitRecord(
            habit_id=habit.id,
            completed_date=target_date,
            completed=desired_completed,
            completed_at=datetime.utcnow() if desired_completed else None,
        )
        db.session.add(record)
    else:
        record.completed = desired_completed
        record.completed_at = datetime.utcnow() if desired_completed else None

    db.session.commit()

    newly_unlocked = []
    if desired_completed:
        newly_unlocked = AchievementService.check_and_unlock_achievements(user_id)

    streak_info = StreakService.calculate_habit_streak(habit.id)
    today_progress = ProgressService.get_today_progress(user_id)

    return success_response(
        data={
            "record": record.to_dict(),
            "completed": record.completed,
            "streak": streak_info,
            "today_progress": today_progress,
            "new_achievements": newly_unlocked,
        },
        message="Habit completion status updated",
        status_code=200,
    )

@tracking_bp.route("/today", methods=["GET"])
@jwt_required()
def get_today_tracking():
    user_id = int(get_jwt_identity())
    today = date.today()

    habits = Habit.query.filter_by(user_id=user_id, status="active").order_by(Habit.created_at.asc()).all()
    habit_ids = [h.id for h in habits]

    today_records = HabitRecord.query.filter(
        HabitRecord.habit_id.in_(habit_ids),
        HabitRecord.completed_date == today
    ).all() if habit_ids else []

    record_map = {r.habit_id: r for r in today_records}

    result = []
    for h in habits:
        rec = record_map.get(h.id)
        is_done = rec.completed if rec else False
        streak_info = StreakService.calculate_habit_streak(h.id)

        result.append({
            "habit": h.to_dict(),
            "completed": is_done,
            "record": rec.to_dict() if rec else None,
            "streak": streak_info,
        })

    today_progress = ProgressService.get_today_progress(user_id)

    return success_response(
        data={
            "date": today.isoformat(),
            "habits": result,
            "progress": today_progress,
        },
        message="Today's tracking status retrieved",
    )

@tracking_bp.route("/history", methods=["GET"])
@jwt_required()
def get_tracking_history():
    user_id = int(get_jwt_identity())
    habit_id = request.args.get("habit_id")
    start_date = validate_date(request.args.get("start_date"))
    end_date = validate_date(request.args.get("end_date"))

    habits = Habit.query.filter_by(user_id=user_id).all()
    habit_ids = [h.id for h in habits]

    if not habit_ids:
        return success_response(data=[], message="No tracking history found")

    query = HabitRecord.query.filter(HabitRecord.habit_id.in_(habit_ids))

    if habit_id:
        query = query.filter_by(habit_id=int(habit_id))
    if start_date:
        query = query.filter(HabitRecord.completed_date >= start_date)
    if end_date:
        query = query.filter(HabitRecord.completed_date <= end_date)

    records = query.order_by(HabitRecord.completed_date.desc()).all()
    return success_response(data=[r.to_dict() for r in records], message="History retrieved")

@tracking_bp.route("/<int:record_id>", methods=["PUT"])
@jwt_required()
def update_record(record_id):
    user_id = int(get_jwt_identity())
    record = HabitRecord.query.get(record_id)
    if not record:
        return error_response("Record not found", status_code=404)

    habit = Habit.query.filter_by(id=record.habit_id, user_id=user_id).first()
    if not habit:
        return error_response("Unauthorized", status_code=403)

    data = request.get_json() or {}
    if "completed" in data:
        record.completed = bool(data["completed"])
        record.completed_at = datetime.utcnow() if record.completed else None

    db.session.commit()
    return success_response(data=record.to_dict(), message="Record updated")
