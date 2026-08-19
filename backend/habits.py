"""
MODULE: habits.py
------------------
CRUD for habits themselves, plus the "check-in" endpoints that toggle
whether a habit was done on a given day. This module never computes
streaks or stats — that's analytics.py's job, kept separate so each
file has one clear responsibility.
"""

from datetime import date, datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Habit, HabitLog

habits_bp = Blueprint("habits", __name__, url_prefix="/api/habits")


def _current_user_id():
    return int(get_jwt_identity())


@habits_bp.get("")
@jwt_required()
def list_habits():
    include_archived = request.args.get("archived", "false") == "true"
    query = Habit.query.filter_by(user_id=_current_user_id())
    if not include_archived:
        query = query.filter_by(archived=False)
    habits = query.order_by(Habit.created_at.asc()).all()
    return jsonify([h.to_dict() for h in habits])


@habits_bp.post("")
@jwt_required()
def create_habit():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "Habit title is required."}), 400

    habit = Habit(
        user_id=_current_user_id(),
        title=title,
        icon=data.get("icon", "✅"),
        color=data.get("color", "#2F6F63"),
        frequency=data.get("frequency", "daily"),
        target_days=data.get("target_days", "1234567"),
    )
    db.session.add(habit)
    db.session.commit()
    return jsonify(habit.to_dict()), 201


@habits_bp.put("/<int:habit_id>")
@jwt_required()
def update_habit(habit_id):
    habit = Habit.query.filter_by(id=habit_id, user_id=_current_user_id()).first_or_404()
    data = request.get_json(silent=True) or {}

    for field in ("title", "icon", "color", "frequency", "target_days", "archived"):
        if field in data:
            setattr(habit, field, data[field])

    db.session.commit()
    return jsonify(habit.to_dict())


@habits_bp.delete("/<int:habit_id>")
@jwt_required()
def delete_habit(habit_id):
    habit = Habit.query.filter_by(id=habit_id, user_id=_current_user_id()).first_or_404()
    db.session.delete(habit)
    db.session.commit()
    return jsonify({"deleted": True})


@habits_bp.post("/<int:habit_id>/toggle")
@jwt_required()
def toggle_checkin(habit_id):
    """
    Marks / unmarks a habit as done for a given date (defaults to today).
    Toggling is idempotent-friendly: if a log exists for that date it's
    removed (undo), otherwise it's created (done).
    """
    habit = Habit.query.filter_by(id=habit_id, user_id=_current_user_id()).first_or_404()
    data = request.get_json(silent=True) or {}
    log_date_str = data.get("date")
    log_date = (
        datetime.strptime(log_date_str, "%Y-%m-%d").date() if log_date_str else date.today()
    )

    existing = HabitLog.query.filter_by(habit_id=habit.id, log_date=log_date).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"date": log_date.isoformat(), "done": False})

    db.session.add(HabitLog(habit_id=habit.id, log_date=log_date, note=data.get("note")))
    db.session.commit()
    return jsonify({"date": log_date.isoformat(), "done": True})


@habits_bp.get("/<int:habit_id>/logs")
@jwt_required()
def get_logs(habit_id):
    habit = Habit.query.filter_by(id=habit_id, user_id=_current_user_id()).first_or_404()
    logs = HabitLog.query.filter_by(habit_id=habit.id).order_by(HabitLog.log_date.asc()).all()
    return jsonify([l.to_dict() for l in logs])
