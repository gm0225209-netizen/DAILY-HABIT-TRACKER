from datetime import date, timedelta
from models import HabitRecord, Habit

class StreakService:
    @staticmethod
    def calculate_habit_streak(habit_id: int) -> dict:
        records = (
            HabitRecord.query.filter_by(habit_id=habit_id, completed=True)
            .order_by(HabitRecord.completed_date.desc())
            .all()
        )

        if not records:
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "total_completed": 0,
                "weekly_streak": 0,
                "monthly_streak": 0,
            }

        completed_dates = {r.completed_date for r in records}
        sorted_dates = sorted(list(completed_dates), reverse=True)

        today = date.today()
        yesterday = today - timedelta(days=1)

        # Current Streak calculation
        current_streak = 0
        check_date = today if today in completed_dates else yesterday

        while check_date in completed_dates:
            current_streak += 1
            check_date -= timedelta(days=1)

        # Longest Streak calculation
        longest_streak = 0
        if sorted_dates:
            temp_streak = 1
            longest_streak = 1
            asc_dates = sorted(list(completed_dates))
            for i in range(1, len(asc_dates)):
                if asc_dates[i] == asc_dates[i - 1] + timedelta(days=1):
                    temp_streak += 1
                else:
                    temp_streak = 1
                if temp_streak > longest_streak:
                    longest_streak = temp_streak

        last_7_days = [today - timedelta(days=i) for i in range(7)]
        weekly_completions = sum(1 for d in last_7_days if d in completed_dates)

        last_30_days = [today - timedelta(days=i) for i in range(30)]
        monthly_completions = sum(1 for d in last_30_days if d in completed_dates)

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "total_completed": len(completed_dates),
            "weekly_streak": weekly_completions,
            "monthly_streak": monthly_completions,
        }

    @staticmethod
    def calculate_user_streaks(user_id: int) -> dict:
        active_habits = Habit.query.filter_by(user_id=user_id, status="active").all()
        if not active_habits:
            return {
                "max_current_streak": 0,
                "max_longest_streak": 0,
                "average_streak": 0,
                "habits_with_streak": 0,
                "habits": [],
            }

        habit_streaks = []
        current_streaks = []
        longest_streaks = []

        for habit in active_habits:
            s = StreakService.calculate_habit_streak(habit.id)
            habit_streaks.append({
                "habit_id": habit.id,
                "habit_name": habit.name,
                "color": habit.color,
                "icon": habit.icon,
                **s
            })
            current_streaks.append(s["current_streak"])
            longest_streaks.append(s["longest_streak"])

        max_current = max(current_streaks) if current_streaks else 0
        max_longest = max(longest_streaks) if longest_streaks else 0
        avg_streak = round(sum(current_streaks) / len(current_streaks), 1) if current_streaks else 0
        habits_with_streak = sum(1 for cs in current_streaks if cs > 0)

        return {
            "max_current_streak": max_current,
            "max_longest_streak": max_longest,
            "average_streak": avg_streak,
            "habits_with_streak": habits_with_streak,
            "habits": habit_streaks,
        }
