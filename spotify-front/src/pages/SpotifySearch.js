import React, { useState } from "react";

const BACKEND_URL = "http://localhost:5000"; // Change si besoin

export default function SpotifySearch() {
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchArtists = async (q) => {
    const res = await fetch(`${BACKEND_URL}/spotify/search/artists?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`Erreur API Artistes: ${res.statusText}`);
    return res.json();
  };

  const fetchTracks = async (q) => {
    const res = await fetch(`${BACKEND_URL}/spotify/search/tracks?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`Erreur API Morceaux: ${res.statusText}`);
    return res.json();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const [artistsData, tracksData] = await Promise.all([
        fetchArtists(query),
        fetchTracks(query),
      ]);
      setArtists(artistsData);
      setTracks(tracksData);
    } catch (e) {
      setError(e.message);
      setArtists([]);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Recherche Spotify</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Artiste ou morceau"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Erreur: {error}</p>}

      <h3>Artistes</h3>
      <ul>
        {artists.map((a) => (
          <li key={a.id}>
            <strong>{a.name}</strong> — Genres: {a.genres?.join(", ")}
            {a.images?.length > 0 && (
              <img
                src={a.images[0].url}
                alt={a.name}
                style={{ width: 50, height: 50, objectFit: "cover", marginLeft: 10 }}
              />
            )}
          </li>
        ))}
      </ul>

      <h3>Morceaux</h3>
      <ul>
        {tracks.map((t) => (
          <li key={t.id}>
            <strong>{t.name}</strong> par {t.artist} — Album: {t.album}
            {t.preview_url && (
              <audio controls src={t.preview_url} style={{ marginLeft: 10 }}>
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
