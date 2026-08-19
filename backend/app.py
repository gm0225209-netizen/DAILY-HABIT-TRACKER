import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

try:
    from .config import Config
    from .models import db
    from .routes import register_routes
except ImportError:
    from config import Config
    from models import db
    from routes import register_routes

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure instance directory exists
    try:
        os.makedirs(os.path.join(os.path.dirname(__file__), "instance"), exist_ok=True)
    except OSError:
        pass

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # JWT Error handlers for clean JSON responses
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({
            "success": False,
            "message": "Missing or invalid authorization token",
            "error": "unauthorized"
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({
            "success": False,
            "message": "Signature verification failed or token is corrupted",
            "error": "invalid_token"
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "success": False,
            "message": "Token has expired. Please log in again",
            "error": "token_expired"
        }), 401

    # Register all 15 module REST API routes
    register_routes(app)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "success": True,
            "status": "healthy",
            "message": "Daily Habit Tracker REST API is online"
        }), 200

    # Global error handler
    @app.errorhandler(404)
    def not_found_handler(e):
        return jsonify({
            "success": False,
            "message": "Endpoint or resource not found",
            "error": str(e)
        }), 404

    @app.errorhandler(500)
    def internal_error_handler(e):
        return jsonify({
            "success": False,
            "message": "An internal server error occurred",
            "error": str(e)
        }), 500

    with app.app_context():
        db.create_all()
        try:
            try:
                from .seed import seed_demo_user
            except ImportError:
                from seed import seed_demo_user
            seed_demo_user(force=False)
        except Exception as seed_err:
            print(f"[SEED] Notice during auto-seed: {seed_err}")

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"[API] Habit Tracker Flask API running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
