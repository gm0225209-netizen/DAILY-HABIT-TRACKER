import calendar as pycalendar
from datetime import date
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Habit, HabitRecord
from utils.helpers import success_response

calendar_bp = Blueprint("calendar", __name__, url_prefix="/api/calendar")

@calendar_bp.route("", methods=["GET"])
@calendar_bp.route("/<int:year>/<int:month>", methods=["GET"])
@jwt_required()
def get_calendar_matrix(year=None, month=None):
    user_id = int(get_jwt_identity())
    today = date.today()

    if year is None:
        year = today.year
    if month is None:
        month = today.month

    _, num_days = pycalendar.monthrange(year, month)
    month_start = date(year, month, 1)
    month_end = date(year, month, num_days)

    habits = Habit.query.filter_by(user_id=user_id, status="active").all()
    habit_ids = [h.id for h in habits]
    total_active = len(habits)

    records = HabitRecord.query.filter(
        HabitRecord.habit_id.in_(habit_ids),
        HabitRecord.completed_date >= month_start,
        HabitRecord.completed_date <= month_end,
        HabitRecord.completed == True
    ).all() if habit_ids else []

    records_by_date = {}
    for r in records:
        d_str = r.completed_date.isoformat()
        if d_str not in records_by_date:
            records_by_date[d_str] = []
        records_by_date[d_str].append(r.habit_id)

    days_data = []
    for day_num in range(1, num_days + 1):
        cur_date = date(year, month, day_num)
        cur_date_str = cur_date.isoformat()
        done_ids = set(records_by_date.get(cur_date_str, []))
        completed_count = len(done_ids)
        pct = round((completed_count / total_active) * 100, 1) if total_active > 0 else 0.0

        habits_detail = [
            {
                "id": h.id,
                "name": h.name,
                "color": h.color,
                "icon": h.icon,
                "category": h.category,
                "completed": h.id in done_ids,
            }
            for h in habits
        ]

        days_data.append({
            "day": day_num,
            "date": cur_date_str,
            "day_of_week": cur_date.strftime("%a"),
            "is_today": cur_date == today,
            "is_past": cur_date < today,
            "is_future": cur_date > today,
            "completed_count": completed_count,
            "total_habits": total_active,
            "completion_percentage": pct,
            "habits": habits_detail,
        })

    return success_response(
        data={
            "year": year,
            "month": month,
            "month_name": pycalendar.month_name[month],
            "total_active_habits": total_active,
            "days": days_data,
        },
        message="Calendar data retrieved",
    )
