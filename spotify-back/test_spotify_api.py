import os
from spotipy import Spotify
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv

load_dotenv()

def test_spotify_api():
    client_id = os.getenv("SPOTIPY_CLIENT_ID")
    client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")

    auth_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
    sp = Spotify(auth_manager=auth_manager)

    # Recherche un artiste
    results = sp.search(q='Daft Punk', type='artist', limit=1)
    artists = results.get('artists', {}).get('items', [])
    if artists:
        artist = artists[0]
        print(f"Artiste trouvé: {artist['name']} (ID: {artist['id']})")
    else:
        print("Artiste non trouvé")

    # Recherche un titre
    results = sp.search(q='One More Time', type='track', limit=1)
    tracks = results.get('tracks', {}).get('items', [])
    if tracks:
        track = tracks[0]
        print(f"Track trouvé: {track['name']} par {track['artists'][0]['name']}")
    else:
        print("Titre non trouvé")

if __name__ == "__main__":
    test_spotify_api()
