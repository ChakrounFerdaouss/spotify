from flask import Blueprint, jsonify, current_app
from bson import ObjectId
from flask_cors import cross_origin
from pymongo.errors import PyMongoError
from functools import wraps
from flask import request
import jwt
import os

reports_bp = Blueprint("reports", __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]
        if not token:
            return jsonify({"message": "Token manquant"}), 401
        try:
            data = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
            current_user_id = data["user_id"]
        except Exception as e:
            print("Erreur JWT:", e)
            return jsonify({"message": "Token invalide"}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

@reports_bp.route("/top-artists", methods=["GET"])  # <-- juste /top-artists
@token_required
@cross_origin()
def top_artists(current_user_id):
    try:
        pipeline = [
            {"$match": {"user_id": ObjectId(current_user_id)}},
            {"$unwind": "$tracks"},
            {"$group": {
                "_id": "$tracks.artist",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]

        result = list(current_app.db.playlists.aggregate(pipeline))
        
        top_artists = [{"artist": r["_id"], "count": r["count"]} for r in result]

        return jsonify(top_artists)
    except PyMongoError as e:
        print("Erreur lors de l'agrégation top artists:", e)
        return jsonify({"error": "Erreur lors de l'agrégation", "details": str(e)}), 500
    
@reports_bp.route("/genre-distribution", methods=["GET"])  # <-- juste /genre-distribution
@token_required
@cross_origin()
def genre_distribution(current_user_id):
    try:
        pipeline = [
            {"$match": {"user_id": ObjectId(current_user_id)}},
            {"$unwind": "$tracks"},
            {"$group": {
                "_id": "$tracks.genre",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]

        result = list(current_app.db.playlists.aggregate(pipeline))

        genre_data = [{"genre": r["_id"], "count": r["count"]} for r in result if r["_id"]]

        return jsonify(genre_data)
    except PyMongoError as e:
        print("Erreur lors de l'agrégation genre distribution:", e)
        return jsonify({"error": "Erreur lors de l'agrégation des genres."}), 500
