import requests

def test_track_trend(track_id):
    url = "http://127.0.0.1:5000/spotify/track-trend"
    params = {"track_id": track_id}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"Track ID: {track_id}")
        print("Trend:", data.get("trend"))
        print("History:")
        for entry in data.get("history", []):
            print(f"  Date: {entry['date']}, Popularity: {entry['popularity']}")
    else:
        print(f"Erreur {response.status_code} pour le track_id {track_id}")

if __name__ == "__main__":
    # Test avec des track_id connus
    track_ids = [
        "3n3Ppam7vgaVa1iaRUc9Lp",  # exemple que tu as montré
        "3QaPy1KgI7nu9FJEQUgn6h",  # un autre track_id
        "6wf7Yu7cxBSPrRlWeSeK0Q"   # un autre track_id
    ]
    for tid in track_ids:
        test_track_trend(tid)
        print("-" * 40)
