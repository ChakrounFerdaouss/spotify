import os
import random
from datetime import datetime, timedelta
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

    def get_popular_albums(self, limit=20):
        """
        Get popular albums by fetching new releases (can be replaced with any curated playlist)
        """
        try:
            results = self.sp.new_releases(limit=limit)
            albums = results.get("albums", {}).get("items", [])
            return albums
        except Exception as e:
            print(f"Error fetching popular albums: {e}")
            return None

    def get_album_streams_over_time(self):
        """
        Mock method to return album streams data over time.
        Replace this with real data fetching logic if available.
        """
        try:
            dates = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in reversed(range(7))]
            albums = [
                {
                    "name": "Album A",
                    "streams": [random.randint(1000, 5000) for _ in dates],
                    "color": "rgba(75,192,192,1)"
                },
                {
                    "name": "Album B",
                    "streams": [random.randint(1000, 5000) for _ in dates],
                    "color": "rgba(255,99,132,1)"
                },
            ]
            return {"dates": dates, "albums": albums}
        except Exception as e:
            print(f"Error generating album streams data: {e}")
            return None

    def get_trend_stream_counts(self):
        """
        Mock method to return stream counts by playlist/trend.
        Replace this with real data fetching logic if available.
        """
        try:
            labels = ["Playlist 1", "Playlist 2", "Playlist 3", "Playlist 4"]
            stream_counts = [random.randint(10000, 50000) for _ in labels]
            return {"labels": labels, "streamCounts": stream_counts}
        except Exception as e:
            print(f"Error generating trend stream data: {e}")
            return None
