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

@spotify_bp.route("/popular/albums")
def popular_albums():
    albums = client.get_popular_albums()
    if albums is None:
        return jsonify({"error": "Could not fetch popular albums"}), 500

    simplified = [{
        "id": album["id"],
        "name": album["name"],
        "artist": album["artists"][0]["name"] if album.get("artists") else "Unknown",
        "images": album.get("images", []),
        "release_date": album.get("release_date", ""),
        "total_tracks": album.get("total_tracks", 0)
    } for album in albums]

    return jsonify(simplified)

@spotify_bp.route("/albums/streams")
def album_streams():
    data = client.get_album_streams_over_time()
    if not data:
        return jsonify({"error": "No album stream data available"}), 500
    return jsonify(data)

@spotify_bp.route("/trends/streams")
def trend_streams():
    data = client.get_trend_stream_counts()
    if not data:
        return jsonify({"error": "No trend stream data available"}), 500
    return jsonify(data)
