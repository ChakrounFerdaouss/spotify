from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
import jwt, os
from functools import wraps
from pymongo.errors import PyMongoError
from flask_cors import cross_origin  # Ajout pour CORS

playlist_bp = Blueprint("playlist", __name__)

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
        print(f"Playlist créée avec ID: {result.inserted_id}")
        return jsonify({"_id": str(result.inserted_id), "message": "Playlist créée avec succès"}), 201
    except PyMongoError as e:
        print("Erreur création playlist:", e)
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
        print("Playlists envoyées :", playlists)
        return jsonify(playlists)
    except PyMongoError as e:
        print("Erreur récupération playlists:", e)
        return jsonify({"error": "Erreur lors de la récupération des playlists", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>/tracks", methods=["POST"])
@token_required
@cross_origin()
def add_track(current_user_id, playlist_id):
    data = request.json
    track = {
        "title": data.get("title"),
        "artist": data.get("artist"),
        "album": data.get("album"),
        "genre": data.get("genre", []),
        "popularity": data.get("popularity", 0)
    }
    print(f"Ajout du track dans playlist {playlist_id} pour user {current_user_id}: {track}")
    try:
        result = current_app.db.playlists.update_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)},
            {"$push": {"tracks": track}}
        )
        if result.modified_count == 0:
            print("Aucune playlist mise à jour. Vérifie les IDs")
            return jsonify({"error": "Aucune playlist mise à jour. Vérifie les IDs"}), 404
        print(f"Track ajouté avec succès, documents modifiés: {result.modified_count}")
        return jsonify({"updated": result.modified_count, "message": "Track ajouté avec succès"})
    except PyMongoError as e:
        print("Erreur ajout track:", e)
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
            print("Playlist non trouvée")
            return jsonify({"error": "Playlist non trouvée"}), 404
        if index >= len(playlist.get("tracks", [])):
            print("Index invalide pour suppression track")
            return jsonify({"error": "Index invalide"}), 400
        removed_track = playlist["tracks"].pop(index)
        current_app.db.playlists.update_one(
            {"_id": ObjectId(playlist_id)},
            {"$set": {"tracks": playlist["tracks"]}}
        )
        print(f"Track supprimé avec succès: {removed_track}")
        return jsonify({"message": "Track supprimé avec succès"})
    except PyMongoError as e:
        print("Erreur suppression track:", e)
        return jsonify({"error": "Erreur lors de la suppression du track", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>/artists", methods=["POST"])
@token_required
@cross_origin()
def add_artist(current_user_id, playlist_id):
    artist = request.json.get("artist")
    if not artist:
        print("Artiste manquant dans la requête")
        return jsonify({"error": "Artiste manquant dans la requête"}), 400
    try:
        result = current_app.db.playlists.update_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)},
            {"$addToSet": {"favorite_artists": artist}}
        )
        if result.modified_count == 0:
            print("Aucune playlist mise à jour. Vérifie les IDs")
            return jsonify({"error": "Aucune playlist mise à jour. Vérifie les IDs"}), 404
        print(f"Artiste ajouté avec succès, documents modifiés: {result.modified_count}")
        return jsonify({"updated": result.modified_count, "message": "Artiste ajouté avec succès"})
    except PyMongoError as e:
        print("Erreur ajout artiste:", e)
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
            print("Artiste non trouvé ou playlist incorrecte")
            return jsonify({"error": "Artiste non trouvé ou playlist incorrecte"}), 404
        print(f"Artiste supprimé avec succès, documents modifiés: {result.modified_count}")
        return jsonify({"removed": result.modified_count, "message": "Artiste supprimé avec succès"})
    except PyMongoError as e:
        print("Erreur suppression artiste:", e)
        return jsonify({"error": "Erreur lors de la suppression de l'artiste", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>", methods=["PUT"])
@token_required
def update_playlist(current_user_id, playlist_id):
    data = request.json
    update = {}
    if "name" in data:
        update["name"] = data["name"]
    if not update:
        return jsonify({"error": "Aucune donnée à mettre à jour"}), 400
    try:
        result = current_app.db.playlists.update_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)},
            {"$set": update}
        )
        if result.modified_count == 0:
            return jsonify({"error": "Playlist non trouvée ou rien à modifier"}), 404
        return jsonify({"message": "Playlist mise à jour"})
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de la mise à jour", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>", methods=["DELETE"])
@token_required
def delete_playlist(current_user_id, playlist_id):
    try:
        result = current_app.db.playlists.delete_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)}
        )
        if result.deleted_count == 0:
            return jsonify({"error": "Playlist non trouvée"}), 404
        return jsonify({"message": "Playlist supprimée"})
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de la suppression", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>/tracks/<int:index>", methods=["PUT"])
@token_required
def update_track(current_user_id, playlist_id, index):
    data = request.json
    try:
        playlist = current_app.db.playlists.find_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)}
        )
        if not playlist:
            return jsonify({"error": "Playlist non trouvée"}), 404
        if index >= len(playlist.get("tracks", [])):
            return jsonify({"error": "Index invalide"}), 400
        for key in ["title", "artist", "album", "genre", "popularity"]:
            if key in data:
                playlist["tracks"][index][key] = data[key]
        current_app.db.playlists.update_one(
            {"_id": ObjectId(playlist_id)},
            {"$set": {"tracks": playlist["tracks"]}}
        )
        return jsonify({"message": "Track mis à jour"})
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de la mise à jour du track", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>/tracks/<int:index>", methods=["GET"])
@token_required
def get_track(current_user_id, playlist_id, index):
    try:
        playlist = current_app.db.playlists.find_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)}
        )
        if not playlist:
            return jsonify({"error": "Playlist non trouvée"}), 404
        tracks = playlist.get("tracks", [])
        if index >= len(tracks):
            return jsonify({"error": "Index invalide"}), 400
        return jsonify(tracks[index])
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de la récupération du track", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>/artists/<int:index>", methods=["PUT"])
@token_required
def update_favorite_artist(current_user_id, playlist_id, index):
    data = request.json
    try:
        playlist = current_app.db.playlists.find_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)}
        )
        if not playlist:
            return jsonify({"error": "Playlist non trouvée"}), 404
        fav_artists = playlist.get("favorite_artists", [])
        if index >= len(fav_artists):
            return jsonify({"error": "Index invalide"}), 400
        if isinstance(fav_artists[index], dict):
            fav_artists[index].update(data)
        else:
            fav_artists[index] = data.get("artist", fav_artists[index])
        current_app.db.playlists.update_one(
            {"_id": ObjectId(playlist_id)},
            {"$set": {"favorite_artists": fav_artists}}
        )
        return jsonify({"message": "Artiste favori mis à jour"})
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de la mise à jour de l'artiste favori", "details": str(e)}), 500

@playlist_bp.route("/playlists/<playlist_id>/artists/<int:index>", methods=["GET"])
@token_required
def get_favorite_artist(current_user_id, playlist_id, index):
    try:
        playlist = current_app.db.playlists.find_one(
            {"_id": ObjectId(playlist_id), "user_id": ObjectId(current_user_id)}
        )
        if not playlist:
            return jsonify({"error": "Playlist non trouvée"}), 404
        fav_artists = playlist.get("favorite_artists", [])
        if index >= len(fav_artists):
            return jsonify({"error": "Index invalide"}), 400
        return jsonify(fav_artists[index])
    except PyMongoError as e:
        return jsonify({"error": "Erreur lors de la récupération de l'artiste favori", "details": str(e)}), 500

# --- Aggregations ---

@playlist_bp.route("/playlists/genres/most_represented", methods=["GET"])
def most_represented_genre():
    pipeline = [
        {"$unwind": "$favorite_artists"},
        {"$unwind": {"path": "$favorite_artists.genre", "preserveNullAndEmptyArrays": True}},
        {"$group": {"_id": "$favorite_artists.genre", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    if result:
        return jsonify({"genre": result[0]["_id"], "count": result[0]["count"]})
    return jsonify({"genre": None, "count": 0})

@playlist_bp.route("/playlists/genres/average_popularity", methods=["GET"])
def average_popularity_by_genre():
    pipeline = [
        {"$unwind": "$favorite_artists"},
        {"$unwind": {"path": "$favorite_artists.genre", "preserveNullAndEmptyArrays": True}},
        {"$group": {
            "_id": "$favorite_artists.genre",
            "avg_popularity": {"$avg": "$favorite_artists.popularity"}
        }},
        {"$sort": {"avg_popularity": -1}}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    return jsonify(result)

@playlist_bp.route("/playlists/genres/total_followers", methods=["GET"])
def total_followers_by_genre():
    pipeline = [
        {"$unwind": "$favorite_artists"},
        {"$unwind": {"path": "$favorite_artists.genre", "preserveNullAndEmptyArrays": True}},
        {"$group": {
            "_id": "$favorite_artists.genre",
            "total_followers": {"$sum": "$favorite_artists.followers"}
        }},
        {"$sort": {"total_followers": -1}}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    return jsonify(result)

@playlist_bp.route("/playlists/artists/most_popular", methods=["GET"])
def most_popular_artist():
    pipeline = [
        {"$unwind": "$favorite_artists"},
        {"$sort": {"favorite_artists.popularity": -1}},
        {"$limit": 1},
        {"$project": {"artist": "$favorite_artists", "_id": 0}}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    return jsonify(result[0]["artist"] if result else {})

@playlist_bp.route("/playlists/tracks/most_popular", methods=["GET"])
def most_popular_track():
    pipeline = [
        {"$unwind": "$tracks"},
        {"$sort": {"tracks.popularity": -1}},
        {"$limit": 1},
        {"$project": {"track": "$tracks", "_id": 0}}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    return jsonify(result[0]["track"] if result else {})

@playlist_bp.route("/playlists/count_per_user", methods=["GET"])
def playlists_per_user():
    pipeline = [
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    return jsonify(result)

@playlist_bp.route("/playlists/artists/top", methods=["GET"])
def top_artists():
    n = int(request.args.get("n", 5))
    pipeline = [
        {"$unwind": "$favorite_artists"},
        {"$sort": {"favorite_artists.popularity": -1}},
        {"$limit": n},
        {"$project": {"artist": "$favorite_artists", "_id": 0}}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    return jsonify([r["artist"] for r in result])

@playlist_bp.route("/playlists/tracks/top", methods=["GET"])
def top_tracks():
    n = int(request.args.get("n", 5))
    pipeline = [
        {"$unwind": "$tracks"},
        {"$sort": {"tracks.popularity": -1}},
        {"$limit": n},
        {"$project": {"track": "$tracks", "_id": 0}}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    return jsonify([r["track"] for r in result])

@playlist_bp.route("/playlists/genres/distribution", methods=["GET"])
def genre_distribution():
    pipeline = [
        {"$unwind": "$favorite_artists"},
        {"$unwind": {"path": "$favorite_artists.genre", "preserveNullAndEmptyArrays": True}},
        {"$group": {"_id": "$favorite_artists.genre", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    return jsonify(result)

@playlist_bp.route("/playlists/most_tracks", methods=["GET"])
def playlist_with_most_tracks():
    pipeline = [
        {"$project": {"name": 1, "track_count": {"$size": "$tracks"}}},
        {"$sort": {"track_count": -1}},
        {"$limit": 1}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    return jsonify(result[0] if result else {})

@playlist_bp.route("/playlists/most_favorite_artists", methods=["GET"])
def playlist_with_most_favorite_artists():
    pipeline = [
        {"$project": {"name": 1, "fav_artist_count": {"$size": "$favorite_artists"}}},
        {"$sort": {"fav_artist_count": -1}},
        {"$limit": 1}
    ]
    result = list(current_app.db.playlists.aggregate(pipeline))
    return jsonify(result[0] if result else {})
