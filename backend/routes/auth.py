from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from models import db, User, UserSettings
from utils.helpers import success_response, error_response
from utils.validators import validate_email, validate_password

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name:
        return error_response("Name is required", status_code=400)
    
    if not validate_email(email):
        return error_response("Please enter a valid email address", status_code=400)

    is_valid, msg = validate_password(password)
    if not is_valid:
        return error_response(msg, status_code=400)

    if User.query.filter_by(email=email).first():
        return error_response("An account with this email already exists", status_code=409)

    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    settings = UserSettings(user_id=user.id)
    db.session.add(settings)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return success_response(
        data={
            "user": user.to_dict(),
            "settings": settings.to_dict(),
            "token": token,
        },
        message="Account registered successfully",
        status_code=201,
    )

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return error_response("Email and password are required", status_code=400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response("Invalid email or password", status_code=401)

    if not user.settings:
        user.settings = UserSettings(user_id=user.id)
        db.session.commit()

    token = create_access_token(identity=str(user.id))

    return success_response(
        data={
            "user": user.to_dict(),
            "settings": user.settings.to_dict(),
            "token": token,
        },
        message="Logged in successfully",
        status_code=200,
    )

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return success_response(message="Logged out successfully")

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", status_code=404)

    if not user.settings:
        user.settings = UserSettings(user_id=user.id)
        db.session.commit()

    return success_response(
        data={
            "user": user.to_dict(),
            "settings": user.settings.to_dict(),
        },
        message="Current user profile retrieved",
    )
