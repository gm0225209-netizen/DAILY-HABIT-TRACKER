from datetime import date, timedelta
from models import Habit, HabitRecord
from services.streak_service import StreakService

class AnalyticsService:
    @staticmethod
    def get_weekly_analytics(user_id: int) -> dict:
        habits = Habit.query.filter_by(user_id=user_id, status="active").all()
        total_active = len(habits)
        habit_ids = [h.id for h in habits]

        today = date.today()
        days_data = []
        total_week_completed = 0
        total_week_possible = total_active * 7

        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            completed_count = 0
            if habit_ids:
                completed_count = HabitRecord.query.filter(
                    HabitRecord.habit_id.in_(habit_ids),
                    HabitRecord.completed_date == target_date,
                    HabitRecord.completed == True
                ).count()
            
            pending_count = max(0, total_active - completed_count)
            rate = round((completed_count / total_active * 100), 1) if total_active > 0 else 0
            total_week_completed += completed_count

            days_data.append({
                "date": target_date.isoformat(),
                "day": target_date.strftime("%a"),
                "completed": completed_count,
                "pending": pending_count,
                "total": total_active,
                "rate": rate,
            })

        weekly_rate = round((total_week_completed / total_week_possible * 100), 1) if total_week_possible > 0 else 0

        prior_week_completed = 0
        for i in range(13, 6, -1):
            prior_date = today - timedelta(days=i)
            if habit_ids:
                prior_week_completed += HabitRecord.query.filter(
                    HabitRecord.habit_id.in_(habit_ids),
                    HabitRecord.completed_date == prior_date,
                    HabitRecord.completed == True
                ).count()
        prior_rate = round((prior_week_completed / total_week_possible * 100), 1) if total_week_possible > 0 else 0
        trend_diff = round(weekly_rate - prior_rate, 1)

        return {
            "daily_trends": days_data,
            "weekly_rate": weekly_rate,
            "prior_weekly_rate": prior_rate,
            "trend_difference": trend_diff,
            "total_completed": total_week_completed,
            "total_possible": total_week_possible,
        }

    @staticmethod
    def get_monthly_analytics(user_id: int) -> dict:
        habits = Habit.query.filter_by(user_id=user_id, status="active").all()
        total_active = len(habits)
        habit_ids = [h.id for h in habits]

        today = date.today()
        days_data = []
        total_month_completed = 0
        total_month_possible = total_active * 30

        for i in range(29, -1, -1):
            target_date = today - timedelta(days=i)
            completed_count = 0
            if habit_ids:
                completed_count = HabitRecord.query.filter(
                    HabitRecord.habit_id.in_(habit_ids),
                    HabitRecord.completed_date == target_date,
                    HabitRecord.completed == True
                ).count()
            
            rate = round((completed_count / total_active * 100), 1) if total_active > 0 else 0
            total_month_completed += completed_count

            days_data.append({
                "date": target_date.isoformat(),
                "day": target_date.strftime("%d %b"),
                "completed": completed_count,
                "rate": rate,
            })

        monthly_rate = round((total_month_completed / total_month_possible * 100), 1) if total_month_possible > 0 else 0

        return {
            "daily_trends": days_data,
            "monthly_rate": monthly_rate,
            "total_completed": total_month_completed,
            "total_possible": total_month_possible,
        }

    @staticmethod
    def get_habit_comparison(user_id: int) -> dict:
        habits = Habit.query.filter_by(user_id=user_id).all()
        if not habits:
            return {
                "habits": [],
                "most_successful": None,
                "least_successful": None,
                "category_breakdown": [],
            }

        comparison_list = []
        category_map = {}
        today = date.today()
        last_30_days_count = 30

        for h in habits:
            records = HabitRecord.query.filter(
                HabitRecord.habit_id == h.id,
                HabitRecord.completed == True
            ).all()

            completed_dates = {r.completed_date for r in records}
            last_30 = sum(1 for i in range(30) if (today - timedelta(days=i)) in completed_dates)
            rate_30 = round((last_30 / last_30_days_count) * 100, 1)

            streak_info = StreakService.calculate_habit_streak(h.id)

            item = {
                "id": h.id,
                "name": h.name,
                "category": h.category,
                "color": h.color,
                "icon": h.icon,
                "status": h.status,
                "total_completed": len(records),
                "completion_rate_30d": rate_30,
                "current_streak": streak_info["current_streak"],
                "longest_streak": streak_info["longest_streak"],
            }
            comparison_list.append(item)

            cat = h.category or "General"
            if cat not in category_map:
                category_map[cat] = {"category": cat, "count": 0, "completed_total": 0}
            category_map[cat]["count"] += 1
            category_map[cat]["completed_total"] += len(records)

        active_items = [c for c in comparison_list if c["status"] == "active"]
        sorted_by_rate = sorted(active_items, key=lambda x: (x["completion_rate_30d"], x["total_completed"]), reverse=True)

        most_successful = sorted_by_rate[0] if sorted_by_rate else None
        least_successful = sorted_by_rate[-1] if len(sorted_by_rate) > 1 else None

        category_breakdown = list(category_map.values())

        return {
            "habits": comparison_list,
            "most_successful": most_successful,
            "least_successful": least_successful,
            "category_breakdown": category_breakdown,
        }
