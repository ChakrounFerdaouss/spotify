from flask import Blueprint, request, jsonify
from .spotify_client import SpotifyClient

spotify_bp = Blueprint("spotify", __name__)
client = SpotifyClient()

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
