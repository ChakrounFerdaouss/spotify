from flask import Blueprint, request, jsonify
from .spotify_client import SpotifyClient

spotify_bp = Blueprint("spotify", __name__)
client = SpotifyClient()  # ton client encapsulé

@spotify_bp.route("/search/artists")
def search_artists():
    query = request.args.get("q", "")
    if not query:
        return jsonify({"error": "Paramètre 'q' manquant"}), 400
    artists = client.search_artist(query)
    simplified = [{"id": a["id"], "name": a["name"], "genres": a.get("genres", []), "images": a.get("images", [])} for a in artists]
    return jsonify(simplified)

@spotify_bp.route("/search/tracks")
def search_tracks():
    query = request.args.get("q", "")
    if not query:
        return jsonify({"error": "Paramètre 'q' manquant"}), 400
    tracks = client.search_track(query)
    simplified = [{"id": t["id"], "name": t["name"], "artist": t["artists"][0]["name"], "album": t["album"]["name"], "preview_url": t.get("preview_url")} for t in tracks]
    return jsonify(simplified)

@spotify_bp.route('/popular-artists', methods=['GET'])
def popular_artists():
    # Exemple simple : récupérer des artistes populaires via Spotify API
    try:
        sp = client.get_raw_client()
        results = sp.search(q="year:2024", type="artist", limit=10)
        artists = results.get("artists", {}).get("items", [])
        simplified = [{"id": a["id"], "name": a["name"], "genres": a.get("genres", []), "images": a.get("images", [])} for a in artists]
        return jsonify(simplified)
    except Exception as e:
        print("Erreur popular artists:", e)
        return jsonify({"error": "Erreur serveur"}), 500

@spotify_bp.route('/popular-tracks', methods=['GET'])
def popular_tracks():
    try:
        sp = client.get_raw_client()
        results = sp.search(q="year:2024", type="track", limit=10)
        tracks = results.get("tracks", {}).get("items", [])
        simplified = [{"id": t["id"], "name": t["name"], "artist": t["artists"][0]["name"], "album": t["album"]["name"], "preview_url": t.get("preview_url")} for t in tracks]
        return jsonify(simplified)
    except Exception as e:
        print("Erreur popular tracks:", e)
        return jsonify({"error": "Erreur serveur"}), 500

@spotify_bp.route("/track-trend", methods=["GET"])
def track_trend():
    from pymongo import MongoClient
    from statistics import mean

    track_id = request.args.get("track_id")
    if not track_id:
        return jsonify({"error": "Paramètre 'track_id' manquant"}), 400

    # Connexion MongoDB (adapte si URI différente)
    MONGO_URI = "mongodb://localhost:27017"
    client_mongo = MongoClient(MONGO_URI)
    db = client_mongo["spotify_db"]
    collection = db["popularity"]

    docs = list(collection.find({"track_id": track_id}).sort("date", 1))

    if len(docs) < 3:
        return jsonify({"trend": "données insuffisantes", "history": docs})

    pops = [doc["popularity"] for doc in docs]
    mid = len(pops) // 2
    first_half = mean(pops[:mid])
    second_half = mean(pops[mid:])

    if second_half > first_half + 2:
        trend = "augmentation"
    elif second_half < first_half - 2:
        trend = "diminution"
    else:
        trend = "stabilité"

    history = [{"date": doc["date"], "popularity": doc["popularity"]} for doc in docs]

    return jsonify({
        "track_id": track_id,
        "trend": trend,
        "history": history
    })
    
@spotify_bp.route("/artist-tracks")
def artist_tracks():
    artist_id = request.args.get("artist_id")
    if not artist_id:
        return jsonify({"error": "Paramètre 'artist_id' manquant"}), 400
    
    tracks = client.get_artist_top_tracks(artist_id)  # méthode ajoutée dans SpotifyClient
    
    simplified_tracks = [{"id": t["id"], "name": t["name"]} for t in tracks]
    return jsonify(simplified_tracks)
    
@spotify_bp.route("/popularity-history", methods=["GET"])
def get_popularity_history():
    from pymongo import MongoClient

    # Connexion MongoDB
    MONGO_URI = "mongodb://localhost:27017"
    client_mongo = MongoClient(MONGO_URI)
    db = client_mongo["spotify_db"]
    collection = db["popularity"]

    docs = list(collection.find({}, {"_id": 0}))  # Retirer le champ _id

    return jsonify(docs)
