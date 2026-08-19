from datetime import date
from models import Habit, HabitRecord, Goal

class ProgressService:
    @staticmethod
    def get_today_progress(user_id: int) -> dict:
        today = date.today()
        active_habits = Habit.query.filter_by(user_id=user_id, status="active").all()
        total_habits = len(active_habits)

        if total_habits == 0:
            return {
                "date": today.isoformat(),
                "total_habits": 0,
                "completed_habits": 0,
                "pending_habits": 0,
                "completion_percentage": 0.0,
                "habits_progress": [],
            }

        habit_ids = [h.id for h in active_habits]
        today_records = HabitRecord.query.filter(
            HabitRecord.habit_id.in_(habit_ids),
            HabitRecord.completed_date == today,
            HabitRecord.completed == True
        ).all()

        completed_habit_ids = {r.habit_id for r in today_records}
        completed_count = len(completed_habit_ids)
        pending_count = total_habits - completed_count
        percentage = round((completed_count / total_habits) * 100.0, 1)

        habits_progress = []
        for h in active_habits:
            is_done = h.id in completed_habit_ids
            habits_progress.append({
                "habit_id": h.id,
                "name": h.name,
                "category": h.category,
                "priority": h.priority,
                "color": h.color,
                "icon": h.icon,
                "completed": is_done,
                "target": h.target,
                "progress": 1 if is_done else 0,
                "percentage": 100.0 if is_done else 0.0,
            })

        return {
            "date": today.isoformat(),
            "total_habits": total_habits,
            "completed_habits": completed_count,
            "pending_habits": pending_count,
            "completion_percentage": percentage,
            "habits_progress": habits_progress,
        }

    @staticmethod
    def get_overall_progress(user_id: int) -> dict:
        today_prog = ProgressService.get_today_progress(user_id)
        
        goals = Goal.query.filter_by(user_id=user_id).all()
        total_goals = len(goals)
        completed_goals = sum(1 for g in goals if g.status == "completed")
        avg_goal_pct = round(sum(g.percentage for g in goals) / total_goals, 1) if total_goals > 0 else 0.0

        return {
            "today": today_prog,
            "goals": {
                "total_goals": total_goals,
                "completed_goals": completed_goals,
                "in_progress_goals": total_goals - completed_goals,
                "average_percentage": avg_goal_pct,
                "list": [g.to_dict() for g in goals]
            }
        }
