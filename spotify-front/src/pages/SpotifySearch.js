import React, { useState, useEffect } from 'react';
import Playlists from './Playlists'; // Your playlists component
import MostRepresentedGenre from './MostRepresentedGenre';
import { FaSearch, FaMusic, FaChartBar } from 'react-icons/fa';
import API from '../api'; // Your API instance

// --- STYLES ---
const SearchStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Montserrat:wght@400;700&display=swap');
    :root {
      --glow-purple: #ab50ff;
      --gradient-blue: #00c2ff;
      --dark-bg: #121212;
      --input-bg: #282828;
      --text-light: #ffffff;
      --text-gray: #b3b3b3;
    }
    body, html, #root {
      margin: 0;
      height: 100%;
      font-family: 'Montserrat', sans-serif;
      background-color: var(--dark-bg);
      color: var(--text-light);
    }
    .app-container {
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 80px;
      background-color: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 20px;
      gap: 20px;
      flex-shrink: 0;
    }
    .sidebar-button {
      background: none;
      border: none;
      color: var(--text-gray);
      cursor: pointer;
      font-size: 28px;
      padding: 15px 0;
      transition: color 0.3s, filter 0.3s;
    }
    .sidebar-button:hover, .sidebar-button.active {
      color: var(--glow-purple);
      filter: drop-shadow(0 0 8px var(--glow-purple));
    }
    .main-content {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
    }
    .search-header {
      max-width: 800px;
      margin: 0 auto 40px auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .page-title {
      font-family: 'Fredoka One', cursive;
      font-size: 4rem;
      margin-bottom: 40px;
      text-shadow: 0 0 8px var(--glow-purple), 0 0 16px var(--glow-purple), 0 0 24px var(--glow-purple);
    }
    .search-form {
      display: flex;
      gap: 15px;
      width: 100%;
      max-width: 600px;
      justify-content: center;
    }
    .search-input {
      flex-grow: 1;
      min-width: 0;
      background-color: var(--input-bg);
      border: 2px solid var(--glow-purple);
      box-shadow: 0 0 10px rgba(171, 80, 255, 0.5);
      border-radius: 50px;
      padding: 15px 25px;
      color: var(--text-light);
      font-size: 1.1rem;
      transition: box-shadow 0.3s ease;
    }
    .search-input:focus {
      outline: none;
      box-shadow: 0 0 15px rgba(171, 80, 255, 0.8);
    }
    .search-button {
      color: var(--text-light);
      font-weight: 700;
      font-size: 1.1rem;
      border: none;
      border-radius: 50px;
      padding: 15px 35px;
      cursor: pointer;
      background: linear-gradient(90deg, var(--glow-purple), var(--gradient-blue));
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .search-button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    .search-button:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(0, 194, 255, 0.5);
    }
    .content-area {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }
    .content-heading {
      text-align: center;
      font-family: 'Fredoka One', cursive;
      font-size: 2rem;
      color: var(--text-gray);
      margin-bottom: 30px;
    }
    .error-message {
      color: #ff8a8a;
    }
    .results-container {
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    @media (min-width: 992px) {
      .results-container {
        flex-direction: row;
      }
    }
    .results-column {
      flex: 1;
      min-width: 0;
    }
    .results-list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .artist-card {
      background-color: #1c1c1c;
      border-radius: 12px;
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .artist-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }
    .item-name {
      font-weight: 700;
      font-size: 1.1rem;
    }
    .item-details {
      color: var(--text-gray);
      font-size: 0.9rem;
    }
    .track-card {
      background-color: #1c1c1c;
      border-radius: 8px;
      padding: 15px;
    }
    .track-audio-player {
      width: 100%;
      margin-top: 10px;
      height: 40px;
    }
    .top-artists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
      gap: 25px;
    }
    /* Buttons for adding favorites */
    .favorite-button {
      margin-left: auto;
      cursor: pointer;
      background: none;
      border: none;
      color: var(--glow-purple);
      font-size: 1.2rem;
      padding: 0 10px;
      transition: color 0.3s ease;
    }
    .favorite-button:hover {
      color: #ff4d6d;
    }
  `}</style>
);

export default function SpotifySearch() {
  const [activeTab, setActiveTab] = useState('search');

  // Search states
  const [query, setQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [popularTracks, setPopularTracks] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Playlists and selected playlist id
  const [defaultPlaylistId, setDefaultPlaylistId] = useState(null);

  const BACKEND_URL = 'http://127.0.0.1:5000';

  // Fetch playlists on mount and set default playlist id
  useEffect(() => {
    const fetchPlaylists = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await API.get('/playlists', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.length > 0) setDefaultPlaylistId(res.data[0]._id);
      } catch (err) {
        console.error('Failed to fetch playlists', err);
      }
    };
    fetchPlaylists();
  }, []);

  // Fetch popular tracks and artists on mount
  useEffect(() => {
    async function fetchPopular() {
      setLoading(true);
      setError(null);
      try {
        const [tracksRes, artistsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/spotify/popular-tracks`),
          fetch(`${BACKEND_URL}/spotify/popular-artists`)
        ]);
        if (tracksRes.ok) setPopularTracks(await tracksRes.json());
        if (artistsRes.ok) setPopularArtists(await artistsRes.json());
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchPopular();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const [artistsRes, tracksRes] = await Promise.all([
        fetch(`${BACKEND_URL}/spotify/search/artists?q=${encodeURIComponent(query)}`),
        fetch(`${BACKEND_URL}/spotify/search/tracks?q=${encodeURIComponent(query)}`)
      ]);
      if (!artistsRes.ok || !tracksRes.ok) throw new Error('Search request failed');
      setArtists(await artistsRes.json());
      setTracks(await tracksRes.json());
    } catch (e) {
      setError(e.message);
      setArtists([]);
      setTracks([]);
    }
    setLoading(false);
  };

  const handleAddFavoriteArtist = async (artistName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first!');
      return;
    }
    if (!defaultPlaylistId) {
      alert('No playlist selected to add favorites.');
      return;
    }
    try {
      await API.post(
        `/playlists/${defaultPlaylistId}/artists`,
        { artist: artistName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${artistName} added to your favorites!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add favorite artist');
    }
  };

  const handleAddFavoriteTrack = async (track) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first!');
      return;
    }
    if (!defaultPlaylistId) {
      alert('No playlist selected to add favorites.');
      return;
    }
    try {
      await API.post(
        `/playlists/${defaultPlaylistId}/tracks`,
        { title: track.name, artist: track.artist },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${track.name} by ${track.artist} added to your favorites!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add favorite track');
    }
  };

  const RenderContent = () => {
    if (loading) return <h2 className="content-heading">Loading...</h2>;
    if (error) return <h2 className="content-heading error-message">Error: {error}</h2>;

    if (hasSearched) {
      return (
        <div className="content-area">
          <h2 className="content-heading">Search Results</h2>
          {(artists.length === 0 && tracks.length === 0) ? (
            <p style={{ textAlign: 'center' }}>No results found for "{query}"</p>
          ) : (
            <div className="results-container">
              <div className="results-column">
                <h3>Artists</h3>
                <ul className="results-list">
                  {artists.map(artist => (
                    <li key={artist.id} className="artist-card">
                      {artist.images.length > 0 && (
                        <img src={artist.images[0].url} alt={artist.name} className="artist-image" />
                      )}
                      <div className="item-name">{artist.name}</div>
                      <button
                        style={{
                          marginLeft: 'auto',
                          cursor: 'pointer',
                          background: 'none',
                          border: 'none',
                          color: 'var(--glow-purple)',
                          fontSize: '1.2rem',
                          padding: '0 10px'
                        }}
                        onClick={() => handleAddFavoriteArtist(artist.name)}
                        title={`Add ${artist.name} to favorites`}
                      >
                        ❤️
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="results-column">
                <h3>Tracks</h3>
                <ul className="results-list">
                  {tracks.map(track => (
                    <li key={track.id} className="track-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flexGrow: 1 }}>
                        <div className="item-name">{track.name}</div>
                        <div className="item-details">by {track.artist}</div>
                        {track.preview_url && (
                          <audio controls src={track.preview_url} className="track-audio-player" />
                        )}
                      </div>
                      <button
                        style={{
                          cursor: 'pointer',
                          background: 'none',
                          border: 'none',
                          color: 'var(--glow-purple)',
                          fontSize: '1.2rem',
                          padding: '0 10px'
                        }}
                        onClick={() => handleAddFavoriteTrack(track)}
                        title={`Add ${track.name} to favorites`}
                      >
                        🎵
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default popular content view
    return (
      <div className="content-area">
        <div className="results-container">
          <div className="results-column">
            <h2 className="content-heading">🔥 Popular Tracks</h2>
            {popularTracks.length > 0 ? (
              <ul className="results-list">
                {popularTracks.map(track => (
                  <li key={track.id} className="track-card">
                    <div className="item-name">{track.name}</div>
                    <div className="item-details">by {track.artist}</div>
                    {track.preview_url && (
                      <audio controls src={track.preview_url} className="track-audio-player" />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-gray)' }}>
                Loading popular tracks...
              </p>
            )}
          </div>

          <div className="results-column">
            <h2 className="content-heading">🎤 Popular Artists</h2>
            {popularArtists.length > 0 ? (
              <div className="top-artists-grid">
                {popularArtists.map(artist => (
                  <div key={artist.id} className="artist-card">
                    {artist.images.length > 0 && (
                      <img src={artist.images[0].url} alt={artist.name} className="artist-image" />
                    )}
                    <div className="item-name">{artist.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-gray)' }}>
                Loading popular artists...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <SearchStyles />
      <div className="app-container">
        <nav className="sidebar" aria-label="Main navigation">
          <button
            className={`sidebar-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
            title="Search"
            aria-label="Search"
          >
            <FaSearch />
          </button>
          <button
            className={`sidebar-button ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('playlists')}
            title="My Playlists"
            aria-label="My Playlists"
          >
            <FaMusic />
          </button>
          <button
            className={`sidebar-button ${activeTab === 'genre' ? 'active' : ''}`}
            onClick={() => setActiveTab('genre')}
            title="Genre le plus représenté"
            aria-label="Genre le plus représenté"
          >
            <FaChartBar />
          </button>
        </nav>

        <main className="main-content" role="main">
          {activeTab === 'search' ? (
            <>
              <header className="search-header">
                <h1 className="page-title">Search</h1>
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Artist or track name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button type="submit" className="search-button" disabled={loading}>
                    {loading && hasSearched ? '...' : 'Search'}
                  </button>
                </form>
              </header>
              <RenderContent />
            </>
          ) : activeTab === 'playlists' ? (
            <Playlists />
          ) : (
            <MostRepresentedGenre />
          )}
        </main>
      </div>
    </>
  );
}