"""
MODULE: analytics.py
---------------------
Turns raw HabitLog rows into meaningful numbers:
  - current streak (consecutive days up to today/yesterday)
  - longest streak ever
  - completion rate over the last N days
  - a day-by-day map for the heatmap calendar UI

This is intentionally read-only and separate from habits.py so the
"business logic" for stats can be tested and changed without touching
the CRUD endpoints.
"""

from datetime import date, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Habit, HabitLog

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


def _compute_streaks(log_dates: set[date]):
    if not log_dates:
        return 0, 0

    ordered = sorted(log_dates)
    longest = current_run = 1
    for i in range(1, len(ordered)):
        if (ordered[i] - ordered[i - 1]).days == 1:
            current_run += 1
        else:
            current_run = 1
        longest = max(longest, current_run)

    # current streak: walk backwards from today (or yesterday, so a
    # habit not yet done today doesn't look "broken" until midnight)
    today = date.today()
    cursor = today if today in log_dates else today - timedelta(days=1)
    streak = 0
    while cursor in log_dates:
        streak += 1
        cursor -= timedelta(days=1)

    return streak, longest


@analytics_bp.get("/habits/<int:habit_id>")
@jwt_required()
def habit_stats(habit_id):
    habit = Habit.query.filter_by(id=habit_id, user_id=int(get_jwt_identity())).first_or_404()
    log_dates = {l.log_date for l in habit.logs}

    current_streak, longest_streak = _compute_streaks(log_dates)

    window = 30
    window_start = date.today() - timedelta(days=window - 1)
    done_in_window = sum(1 for d in log_dates if d >= window_start)
    completion_rate = round(done_in_window / window * 100)

    heatmap = {d.isoformat(): True for d in log_dates}

    return jsonify({
        "habit_id": habit.id,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "completion_rate_30d": completion_rate,
        "total_completions": len(log_dates),
        "heatmap": heatmap,
    })


@analytics_bp.get("/overview")
@jwt_required()
def overview():
    """Summary card data across ALL of a user's active habits."""
    habits = Habit.query.filter_by(user_id=int(get_jwt_identity()), archived=False).all()

    today = date.today()
    total = len(habits)
    done_today = 0
    best_streak = 0

    for habit in habits:
        log_dates = {l.log_date for l in habit.logs}
        if today in log_dates:
            done_today += 1
        streak, longest = _compute_streaks(log_dates)
        best_streak = max(best_streak, longest)

    return jsonify({
        "total_habits": total,
        "done_today": done_today,
        "best_streak_overall": best_streak,
        "date": today.isoformat(),
    })
