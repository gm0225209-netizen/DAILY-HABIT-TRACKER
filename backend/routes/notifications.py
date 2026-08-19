from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Notification
from services.notification_service import NotificationService
from utils.helpers import success_response, error_response

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifs = NotificationService.get_user_notifications(user_id)
    unread = NotificationService.get_unread_count(user_id)
    return success_response(data={"notifications": notifs, "unread_count": unread}, message="Notifications retrieved")

@notifications_bp.route("", methods=["POST"])
@jwt_required()
def create_notification():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    message = data.get("message", "").strip()
    if not message:
        return error_response("Message is required", status_code=400)

    notif = Notification(
        user_id=user_id,
        habit_id=data.get("habit_id"),
        message=message,
        scheduled_time=data.get("scheduled_time"),
        type=data.get("type", "reminder"),
        is_read=False,
    )
    db.session.add(notif)
    db.session.commit()

    return success_response(data=notif.to_dict(), message="Notification created", status_code=201)

@notifications_bp.route("/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notif_id):
    user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if not notif:
        return error_response("Notification not found", status_code=404)

    notif.is_read = True
    db.session.commit()
    return success_response(data=notif.to_dict(), message="Notification marked as read")

@notifications_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return success_response(message="All notifications marked as read")

@notifications_bp.route("/<int:notif_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notif_id):
    user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if not notif:
        return error_response("Notification not found", status_code=404)

    db.session.delete(notif)
    db.session.commit()
    return success_response(message="Notification deleted")
