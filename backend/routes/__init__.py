from routes.auth import auth_bp
from routes.habits import habits_bp
from routes.tracking import tracking_bp
from routes.dashboard import dashboard_bp
from routes.streaks import streaks_bp
from routes.calendar import calendar_bp
from routes.analytics import analytics_bp
from routes.progress import progress_bp
from routes.notifications import notifications_bp
from routes.achievements import achievements_bp
from routes.goals import goals_bp
from routes.insights import insights_bp
from routes.profile import profile_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(habits_bp)
    app.register_blueprint(tracking_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(streaks_bp)
    app.register_blueprint(calendar_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(achievements_bp)
    app.register_blueprint(goals_bp)
    app.register_blueprint(insights_bp)
    app.register_blueprint(profile_bp)
