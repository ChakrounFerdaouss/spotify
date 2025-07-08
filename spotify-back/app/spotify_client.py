import os
from spotipy import Spotify
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv

load_dotenv()

class SpotifyClient:
    def __init__(self):
        client_id = os.getenv("SPOTIPY_CLIENT_ID")
        client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
        auth_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
        self.sp = Spotify(auth_manager=auth_manager)

    def search_artist(self, name, limit=10):
        results = self.sp.search(q=name, type="artist", limit=limit)
        return results.get("artists", {}).get("items", [])

    def search_track(self, name, limit=10):
        results = self.sp.search(q=name, type="track", limit=limit)
        return results.get("tracks", {}).get("items", [])
