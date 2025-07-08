from flask import Blueprint, request, current_app, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime, os

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    db = current_app.db
    if db.users.find_one({"email": data["email"]}):
        return jsonify({"error": "Email déjà utilisé"}), 400

    user = {
        "username": data["username"],
        "email": data["email"],
        "password_hash": generate_password_hash(data["password"])
    }
    db.users.insert_one(user)
    return jsonify({"message": "Utilisateur enregistré"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    db = current_app.db
    user = db.users.find_one({"email": data["email"]})
    if user and check_password_hash(user["password_hash"], data["password"]):
        payload = {
            "user_id": str(user["_id"]),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        token = jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS256")
        return jsonify({"token": token})
    return jsonify({"error": "Identifiants invalides"}), 401
