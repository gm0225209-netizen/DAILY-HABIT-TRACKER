from datetime import datetime, date, timedelta
from models import db, Achievement, Habit, HabitRecord, Goal, Notification
from services.streak_service import StreakService

ALL_ACHIEVEMENTS = [
    {
        "badge": "first_habit",
        "title": "First Step",
        "description": "Created your very first habit to begin your journey.",
        "icon": "Footprints",
        "category": "Milestone"
    },
    {
        "badge": "habit_3_streak",
        "title": "Ignition",
        "description": "Maintained a 3-day continuous habit streak.",
        "icon": "Zap",
        "category": "Streak"
    },
    {
        "badge": "habit_7_streak",
        "title": "Unstoppable Momentum",
        "description": "Maintained a 7-day continuous habit streak.",
        "icon": "Flame",
        "category": "Streak"
    },
    {
        "badge": "habit_14_streak",
        "title": "Habit Formed",
        "description": "Achieved an impressive 14-day continuous streak.",
        "icon": "ShieldCheck",
        "category": "Streak"
    },
    {
        "badge": "habit_30_streak",
        "title": "Life Transformation",
        "description": "Reached a legendary 30-day streak of daily consistency.",
        "icon": "Trophy",
        "category": "Streak"
    },
    {
        "badge": "habits_10_completed",
        "title": "Consistent Starter",
        "description": "Logged 10 completed habit check-ins.",
        "icon": "CheckCircle2",
        "category": "Completion"
    },
    {
        "badge": "habits_50_completed",
        "title": "Routine Champion",
        "description": "Logged 50 completed habit check-ins.",
        "icon": "Award",
        "category": "Completion"
    },
    {
        "badge": "habits_100_completed",
        "title": "Century Performer",
        "description": "Completed 100 total habit check-ins.",
        "icon": "Crown",
        "category": "Completion"
    },
    {
        "badge": "perfect_week",
        "title": "Perfect Week",
        "description": "Completed all scheduled habits every single day of the week.",
        "icon": "Star",
        "category": "Consistency"
    },
    {
        "badge": "multi_habit",
        "title": "Multi-Tasker",
        "description": "Track 5 or more active habits simultaneously.",
        "icon": "Layers",
        "category": "Milestone"
    },
    {
        "badge": "goal_crusher",
        "title": "Goal Crusher",
        "description": "Successfully accomplished a personal target goal.",
        "icon": "Target",
        "category": "Goals"
    }
]

class AchievementService:
    @staticmethod
    def get_all_available():
        return ALL_ACHIEVEMENTS

    @staticmethod
    def check_and_unlock_achievements(user_id: int) -> list[dict]:
        existing = {a.badge for a in Achievement.query.filter_by(user_id=user_id).all()}
        habits = Habit.query.filter_by(user_id=user_id).all()
        active_habits = [h for h in habits if h.status == "active"]
        
        habit_ids = [h.id for h in habits]
        total_completed_records = 0
        if habit_ids:
            total_completed_records = HabitRecord.query.filter(
                HabitRecord.habit_id.in_(habit_ids),
                HabitRecord.completed == True
            ).count()

        streak_data = StreakService.calculate_user_streaks(user_id)
        max_streak = streak_data.get("max_current_streak", 0)
        longest_streak = streak_data.get("max_longest_streak", 0)
        best_streak = max(max_streak, longest_streak)

        newly_unlocked = []

        def unlock(badge_code):
            if badge_code in existing:
                return
            meta = next((item for item in ALL_ACHIEVEMENTS if item["badge"] == badge_code), None)
            if not meta:
                return
            ach = Achievement(
                user_id=user_id,
                title=meta["title"],
                description=meta["description"],
                badge=meta["badge"],
                icon=meta["icon"],
                category=meta["category"],
                earned_at=datetime.utcnow()
            )
            db.session.add(ach)
            existing.add(badge_code)
            newly_unlocked.append(ach.to_dict())

            notif = Notification(
                user_id=user_id,
                message=f"🎉 Achievement Unlocked: {meta['title']} - {meta['description']}",
                type="achievement",
                is_read=False
            )
            db.session.add(notif)

        if len(habits) >= 1:
            unlock("first_habit")

        if len(active_habits) >= 5:
            unlock("multi_habit")

        if best_streak >= 3:
            unlock("habit_3_streak")
        if best_streak >= 7:
            unlock("habit_7_streak")
        if best_streak >= 14:
            unlock("habit_14_streak")
        if best_streak >= 30:
            unlock("habit_30_streak")

        if total_completed_records >= 10:
            unlock("habits_10_completed")
        if total_completed_records >= 50:
            unlock("habits_50_completed")
        if total_completed_records >= 100:
            unlock("habits_100_completed")

        completed_goal = Goal.query.filter_by(user_id=user_id, status="completed").first()
        if completed_goal:
            unlock("goal_crusher")

        if len(active_habits) > 0 and total_completed_records >= len(active_habits) * 7:
            today = date.today()
            perfect = True
            for day_offset in range(7):
                d = today - timedelta(days=day_offset)
                day_completed = HabitRecord.query.filter(
                    HabitRecord.habit_id.in_([h.id for h in active_habits]),
                    HabitRecord.completed_date == d,
                    HabitRecord.completed == True
                ).count()
                if day_completed < len(active_habits):
                    perfect = False
                    break
            if perfect:
                unlock("perfect_week")

        if newly_unlocked:
            db.session.commit()

        return newly_unlocked
