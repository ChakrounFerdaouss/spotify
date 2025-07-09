import React, { useState } from "react";
import TrackTrendChart from "./TrackTrendChart";

const ArtistSearch = () => {
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [artistTracks, setArtistTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedTrackId(null);
    setArtistTracks([]);
    try {
      const res = await fetch(
        `http://localhost:5000/spotify/search/artists?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Erreur recherche artistes");
      const data = await res.json();
      setArtists(Array.isArray(data) ? data : []);
    } catch {
      setError("Erreur lors de la recherche");
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracksForArtist = async (artistId) => {
    setLoadingTracks(true);
    setSelectedTrackId(null);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/spotify/artist-tracks?artist_id=${artistId}`
      );
      if (!res.ok) throw new Error("Erreur fetch morceaux");
      const data = await res.json();
      setArtistTracks(Array.isArray(data) ? data : []);
    } catch {
      setError("Erreur chargement morceaux");
      setArtistTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  };

  return (
    <div className="artist-search-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

        :root {
          --color-bg: #121212;
          --color-input-bg: #282828;
          --color-primary: #ab50ff;
          --color-gradient: linear-gradient(90deg, #ab50ff, #00c2ff);
          --color-text-light: #eee;
          --color-text-muted: #aaa;
          --color-error: #ff6b6b;
          --border-radius: 12px;
          --transition: 0.3s ease;
        }

        .artist-search-container {
          max-width: 700px;
          margin: 2rem auto;
          font-family: 'Montserrat', sans-serif;
          background-color: var(--color-bg);
          color: var(--color-text-light);
          padding: 2rem;
          border-radius: var(--border-radius);
          box-shadow: 0 0 20px rgba(171, 80, 255, 0.4);
        }

        h2 {
          text-align: center;
          font-weight: 700;
          margin-bottom: 1.5rem;
          font-size: 2rem;
          text-shadow: 0 0 8px var(--color-primary);
        }

        input[type="text"] {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 1.1rem;
          border: 2px solid var(--color-primary);
          background-color: var(--color-input-bg);
          color: var(--color-text-light);
          border-radius: 50px;
          box-shadow: 0 0 10px rgba(171, 80, 255, 0.5);
          transition: box-shadow var(--transition);
          outline: none;
        }
        input[type="text"]:focus {
          box-shadow: 0 0 15px var(--color-primary);
        }

        button {
          margin-top: 1rem;
          background: var(--color-gradient);
          border: none;
          padding: 0.75rem 2rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          border-radius: 50px;
          box-shadow: 0 0 12px var(--color-primary);
          transition: transform var(--transition), box-shadow var(--transition);
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px #00c2ff;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        p {
          margin-top: 1rem;
          text-align: center;
        }
        p.error {
          color: var(--color-error);
          font-weight: 700;
        }

        ul.artists-list,
        ul.tracks-list {
          list-style: none;
          padding-left: 0;
          margin-top: 1rem;
        }

        ul.artists-list li {
          background-color: #1c1c1c;
          margin-top: 0.5rem;
          padding: 1rem 1.2rem;
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: background-color var(--transition);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          box-shadow: 0 0 10px rgba(171, 80, 255, 0.2);
        }
        ul.artists-list li:hover {
          background-color: #2a2a2a;
        }
        ul.artists-list li strong {
          font-size: 1.2rem;
        }
        ul.artists-list li p {
          margin: 0;
          font-style: italic;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        ul.tracks-list li {
          margin: 0.5rem 0;
        }
        ul.tracks-list button {
          width: 100%;
          background-color: #2a2a2a;
          border: none;
          color: var(--color-text-light);
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-size: 1rem;
          transition: background-color var(--transition);
        }
        ul.tracks-list button:hover {
          background-color: var(--color-primary);
          box-shadow: 0 0 15px var(--color-primary);
        }

        h3 {
          margin-top: 2rem;
          text-align: center;
          font-weight: 700;
          font-size: 1.5rem;
          text-shadow: 0 0 8px var(--color-primary);
        }
      `}</style>

      <h2>Recherche d'artiste</h2>
      <input
        type="text"
        placeholder="Tape un nom d'artiste"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button onClick={handleSearch} disabled={loading}>
        Rechercher
      </button>

      {loading && <p>Recherche en cours...</p>}
      {error && <p className="error">{error}</p>}

      <ul className="artists-list">
        {artists.length > 0 ? (
          artists.map((artist) => (
            <li key={artist.id} onClick={() => fetchTracksForArtist(artist.id)}>
              <strong>{artist.name}</strong>
              {artist.genres && artist.genres.length > 0 && (
                <p>Genres : {artist.genres.join(", ")}</p>
              )}
            </li>
          ))
        ) : (
          !loading && <p>Aucun artiste trouvé</p>
        )}
      </ul>

      {loadingTracks && <p>Chargement des morceaux...</p>}

      {artistTracks.length > 0 && (
        <>
          <h3>Choisis un morceau :</h3>
          <ul className="tracks-list">
            {artistTracks.map((track) => (
              <li key={track.id}>
                <button onClick={() => setSelectedTrackId(track.id)}>{track.name}</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedTrackId && <TrackTrendChart trackId={selectedTrackId} />}
    </div>
  );
};

export default ArtistSearch;
