from datetime import datetime, timedelta 
from pymongo import MongoClient
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import random

# ⚠️ Remplace ici avec tes vrais identifiants Spotify
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id="5347a327135244ea823d02e3e6a6c0bc",
    client_secret="494a7e6a7946460aa0bf64e583b90135"
))

# Connexion MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["spotify_db"]
collection = db["popularity"]

def get_artist_id(name):
    results = sp.search(q='artist:' + name, type='artist', limit=1)
    items = results['artists']['items']
    if items:
        return items[0]['id']
    else:
        print(f"Artiste {name} non trouvé.")
        return None

def get_all_tracks_of_artist(artist_id):
    track_ids = []
    albums = []
    results = sp.artist_albums(artist_id, album_type='album,single,compilation', country='US', limit=50)
    albums.extend(results['items'])
    while results['next']:
        results = sp.next(results)
        albums.extend(results['items'])

    album_ids = set()
    for album in albums:
        album_ids.add(album['id'])

    for album_id in album_ids:
        results = sp.album_tracks(album_id, limit=50)
        tracks = results['items']
        while results['next']:
            results = sp.next(results)
            tracks.extend(results['items'])
        for track in tracks:
            if track['id']:
                track_ids.append(track['id'])
    return track_ids

# Liste des artistes
artists = ["Billie Eilish", "Gims"]
all_track_ids = []

for artist_name in artists:
    print(f"Récupération des tracks pour {artist_name}...")
    artist_id = get_artist_id(artist_name)
    if artist_id:
        artist_tracks = get_all_tracks_of_artist(artist_id)
        print(f"{len(artist_tracks)} tracks récupérés pour {artist_name}.")
        all_track_ids.extend(artist_tracks)

print(f"Nombre total de tracks récupérés : {len(all_track_ids)}")

# Simulation popularité sur tous les tracks récupérés
for track_id in all_track_ids:
    track = sp.track(track_id)
    base_popularity = track["popularity"]
    print(f"{track['name']} - Popularité actuelle : {base_popularity}")

    for i in range(30):
        fake_date = (datetime.today() - timedelta(days=29 - i)).strftime('%Y-%m-%d')
        
        simulated_pop = base_popularity + random.randint(-5, 5)
        simulated_pop = max(0, min(100, simulated_pop))
        
        collection.update_one(
            {"track_id": track_id, "date": fake_date},
            {"$set": {"popularity": simulated_pop}},
            upsert=True
        )
        print(f"Insertion: {fake_date} → {simulated_pop}")
