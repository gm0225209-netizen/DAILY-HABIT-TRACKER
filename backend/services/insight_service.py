from datetime import date, timedelta
from models import Habit, HabitRecord, Goal
from services.streak_service import StreakService
from services.analytics_service import AnalyticsService

class InsightService:
    @staticmethod
    def generate_insights(user_id: int) -> list[dict]:
        insights = []
        habits = Habit.query.filter_by(user_id=user_id, status="active").all()
        if not habits:
            return [
                {
                    "id": "welcome_insight",
                    "type": "tip",
                    "title": "Welcome to Your Journey!",
                    "message": "Start by creating your first daily habit to unlock behavioral analytics and smart recommendations.",
                    "score": 100,
                    "icon": "Sparkles",
                    "badge": "Getting Started"
                }
            ]

        habit_ids = [h.id for h in habits]
        today = date.today()

        last_30_records = HabitRecord.query.filter(
            HabitRecord.habit_id.in_(habit_ids),
            HabitRecord.completed_date >= (today - timedelta(days=30)),
            HabitRecord.completed == True
        ).all()

        if last_30_records:
            weekday_checks = sum(1 for r in last_30_records if r.completed_date.weekday() < 5)
            weekend_checks = sum(1 for r in last_30_records if r.completed_date.weekday() >= 5)

            weekday_rate = round(weekday_checks / (len(habits) * 22) * 100, 1) if habits else 0
            weekend_rate = round(weekend_checks / (len(habits) * 8) * 100, 1) if habits else 0

            if weekday_rate > weekend_rate + 15:
                insights.append({
                    "id": "weekday_strong",
                    "type": "pattern",
                    "title": "Weekday Power Routine",
                    "message": f"You complete habits {round(weekday_rate - weekend_rate)}% more consistently on weekdays ({weekday_rate}%) than weekends ({weekend_rate}%). Consider setting lighter weekend targets.",
                    "icon": "Calendar",
                    "badge": "Habit Pattern"
                })
            elif weekend_rate > weekday_rate + 15:
                insights.append({
                    "id": "weekend_strong",
                    "type": "pattern",
                    "title": "Weekend Consistency Champion",
                    "message": f"Your weekend completion rate ({weekend_rate}%) outpaces weekdays ({weekday_rate}%). Plan your workweek transitions to keep the momentum going.",
                    "icon": "Sun",
                    "badge": "Habit Pattern"
                })

        weekly_data = AnalyticsService.get_weekly_analytics(user_id)
        trend_diff = weekly_data.get("trend_difference", 0)
        current_week_rate = weekly_data.get("weekly_rate", 0)

        if trend_diff > 5:
            insights.append({
                "id": "positive_trend",
                "type": "success",
                "title": "Ascending Trajectory",
                "message": f"Your habit completion rate improved by {trend_diff}% this week compared to last week (now at {current_week_rate}%). Keep up the incredible work!",
                "icon": "TrendingUp",
                "badge": "Growth"
            })
        elif trend_diff < -15:
            insights.append({
                "id": "dip_alert",
                "type": "warning",
                "title": "Consistency Dip Detected",
                "message": f"Habit adherence dropped by {abs(trend_diff)}% this week. Focus on completing just your #1 priority habit today to regain momentum.",
                "icon": "AlertCircle",
                "badge": "Attention"
            })

        streak_data = StreakService.calculate_user_streaks(user_id)
        if streak_data.get("max_current_streak", 0) >= 3:
            best_habit = max(streak_data["habits"], key=lambda x: x["current_streak"])
            insights.append({
                "id": f"streak_{best_habit['habit_id']}",
                "type": "achievement",
                "title": f"🔥 Hot Streak: {best_habit['habit_name']}",
                "message": f"You're on a {best_habit['current_streak']}-day streak with '{best_habit['habit_name']}'. You are building neural pathways of long-term consistency!",
                "icon": "Flame",
                "badge": "Streak Master"
            })

        for h in habits:
            recent_count = HabitRecord.query.filter(
                HabitRecord.habit_id == h.id,
                HabitRecord.completed_date >= (today - timedelta(days=4)),
                HabitRecord.completed == True
            ).count()
            if recent_count == 0:
                insights.append({
                    "id": f"at_risk_{h.id}",
                    "type": "tip",
                    "title": f"Revive: {h.name}",
                    "message": f"'{h.name}' hasn't been checked off in the past 4 days. Remember: 2 minutes of a habit is 100% better than 0 minutes.",
                    "icon": "RefreshCw",
                    "badge": "Habit Care"
                })
                break

        goals = Goal.query.filter_by(user_id=user_id, status="in_progress").all()
        if goals:
            closest_goal = max(goals, key=lambda g: g.percentage)
            if closest_goal.percentage >= 75:
                insights.append({
                    "id": f"goal_near_{closest_goal.id}",
                    "type": "milestone",
                    "title": "Goal Finishing Line in Sight!",
                    "message": f"Your goal '{closest_goal.title}' is at {closest_goal.percentage}%. Just a final push to achieve 100% completion!",
                    "icon": "Target",
                    "badge": "Goal Milestone"
                })

        return insights
