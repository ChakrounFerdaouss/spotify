from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
import jwt, os
from functools import wraps
from pymongo.errors import PyMongoError
from flask_cors import cross_origin
from .spotify_client import SpotifyClient

playlist_bp = Blueprint("playlist", __name__)
sp_client = SpotifyClient()

# Token auth decorator
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

@playlist_bp.route("/playlists", methods=["POST"])
@token_required
@cross_origin()
def create_playlist(current_user_id):
    data = request.json
    playlist = {
        "user_id": ObjectId(current_user_id),
        "name": data.get("name"),
        "tracks": [],
        "favorite_artists": []
    }
    try:
        result = current_app.db.playlists.insert_one(playlist)
        return jsonify({"_id": str(result.inserted_id), "message": "Playlist créée avec succès"}), 201
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de la création de la playlist", "details": str(e)}), 500

@playlist_bp.route("/playlists", methods=["GET"])
@token_required
@cross_origin()
def get_playlists(current_user_id):
    try:
        playlists = list(current_app.db.playlists.find({"user_id": ObjectId(current_user_id)}))
        for pl in playlists:
            pl["_id"] = str(pl["_id"])
            pl["user_id"] = str(pl["user_id"])
        return jsonify(playlists)
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de la récupération des playlists", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>/tracks", methods=["POST"])
@token_required
@cross_origin()
def add_track(current_user_id, playlist_id):
    data = request.json
    title = data.get("title")
    artist = data.get("artist")
    genre = data.get("genre", [])
    popularity = 0
    album = data.get("album", None)

    try:
        search_results = sp_client.search_track(f"{title} {artist}")
        if search_results:
            track_data = search_results[0]
            popularity = track_data.get("popularity", 0)
            album = track_data.get("album", {}).get("name", album)
    except Exception as e:
        print("Erreur Spotify API:", e)

    track = {
        "title": title,
        "artist": artist,
        "album": album,
        "genre": genre,
        "popularity": popularity
    }

    try:
        result = current_app.db.playlists.update_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)},
            {"$push": {"tracks": track}}
        )
        if result.modified_count == 0:
            return jsonify({"error": "Aucune playlist mise à jour. Vérifie les IDs"}), 404
        return jsonify({"updated": result.modified_count, "message": "Track ajouté avec succès"})
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de l'ajout du track", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>/tracks/<int:index>", methods=["DELETE"])
@token_required
@cross_origin()
def remove_track(current_user_id, playlist_id, index):
    try:
        playlist = current_app.db.playlists.find_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)}
        )
        if not playlist:
            return jsonify({"error": "Playlist non trouvée"}), 404
        if index >= len(playlist.get("tracks", [])):
            return jsonify({"error": "Index invalide"}), 400
        playlist["tracks"].pop(index)
        current_app.db.playlists.update_one(
            {"_id": ObjectId(playlist_id)},
            {"$set": {"tracks": playlist["tracks"]}}
        )
        return jsonify({"message": "Track supprimé avec succès"})
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de la suppression du track", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>/artists", methods=["POST"])
@token_required
@cross_origin()
def add_artist(current_user_id, playlist_id):
    artist = request.json.get("artist")
    if not artist:
        return jsonify({"error": "Artiste manquant dans la requête"}), 400
    try:
        result = current_app.db.playlists.update_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)},
            {"$addToSet": {"favorite_artists": artist}}
        )
        if result.modified_count == 0:
            return jsonify({"error": "Aucune playlist mise à jour. Vérifie les IDs"}), 404
        return jsonify({"updated": result.modified_count, "message": "Artiste ajouté avec succès"})
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de l'ajout de l'artiste", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>/artists/<artist_name>", methods=["DELETE"])
@token_required
@cross_origin()
def remove_artist(current_user_id, playlist_id, artist_name):
    try:
        result = current_app.db.playlists.update_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)},
            {"$pull": {"favorite_artists": artist_name}}
        )
        if result.modified_count == 0:
            return jsonify({"error": "Artiste non trouvé ou playlist incorrecte"}), 404
        return jsonify({"removed": result.modified_count, "message": "Artiste supprimé avec succès"})
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de la suppression de l'artiste", "details": str(e)}), 500
    
