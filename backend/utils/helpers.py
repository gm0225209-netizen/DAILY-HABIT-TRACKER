from flask import jsonify

def success_response(data=None, message="Success", status_code=200):
    payload = {
        "success": True,
        "message": message,
        "data": data if data is not None else {}
    }
    return jsonify(payload), status_code

def error_response(message="An error occurred", error=None, status_code=400):
    payload = {
        "success": False,
        "message": message,
        "error": error if error is not None else {}
    }
    return jsonify(payload), status_code
