import React, { useState, useEffect } from 'react';
import API from '../api';

const PlaylistsStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

    :root {
      --glow-purple: #ab50ff;
      --gradient-blue: #00c2ff;
      --page-bg: #121212;
      --card-bg: #1c1c1c;
      --input-bg: #282828;
      --text-light: #ffffff;
      --text-gray: #b3b3b3;
    }

    .playlists-container {
      max-width: 900px;
      margin: 0 auto;
      font-family: 'Montserrat', sans-serif;
      color: var(--text-light);
    }

    .create-playlist-header {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }

    .primary-input {
      flex-grow: 1;
      background-color: var(--page-bg);
      border: 2px solid var(--glow-purple);
      box-shadow: 0 0 10px rgba(171, 80, 255, 0.5);
      border-radius: 50px;
      padding: 14px 20px;
      color: var(--text-light);
      font-size: 1rem;
    }
    .primary-input:focus {
      outline: none;
      box-shadow: 0 0 15px rgba(171, 80, 255, 0.8);
    }

    .primary-button {
      background: linear-gradient(90deg, var(--glow-purple), var(--gradient-blue));
      border: none;
      border-radius: 50px;
      padding: 14px 30px;
      color: var(--text-light);
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .primary-button:hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(0, 194, 255, 0.5);
    }

    .playlists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 25px;
    }

    .playlist-card {
      background-color: var(--card-bg);
      border-radius: 12px;
      padding: 24px;
    }

    .card-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-gray);
      margin-top: 20px;
      margin-bottom: 10px;
      border-bottom: 1px solid var(--input-bg);
      padding-bottom: 8px;
    }

    .item-list {
      list-style: none;
      padding: 0;
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: rgba(0,0,0,0.2);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .delete-button {
      background: none;
      border: none;
      color: var(--text-gray);
      cursor: pointer;
      font-size: 1rem;
    }
    .delete-button:hover {
      color: #ff8a8a;
    }

    .add-item-form {
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .add-item-inputs {
      display: flex;
      gap: 10px;
    }

    .secondary-input {
      flex-grow: 1;
      background: var(--input-bg);
      border: 1px solid #444;
      border-radius: 6px;
      padding: 10px;
      color: var(--text-light);
      font-size: 0.9rem;
    }
    .secondary-input:focus {
      outline: none;
      border-color: var(--glow-purple);
    }

    .secondary-button {
      width: 100%;
      background: #333;
      color: var(--text-gray);
      border: 1px solid #444;
      border-radius: 6px;
      padding: 10px;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    .secondary-button:hover {
      background-color: var(--glow-purple);
      color: var(--text-light);
    }
  `}</style>
);

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) fetchPlaylists();
    else alert('Connecte-toi d’abord !');
  }, [token, fetchPlaylists]);

  async function fetchPlaylists() {
    try {
      const res = await API.get('/playlists', { headers: { Authorization: `Bearer ${token}` } });
      setPlaylists(res.data.filter(pl => pl.name && pl.name.trim() !== ''));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la récupération des playlists');
    }
  }

  async function createPlaylist() {
    if (!newName.trim()) return;
    try {
      await API.post('/playlists', { name: newName }, { headers: { Authorization: `Bearer ${token}` } });
      setNewName('');
      fetchPlaylists();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création de la playlist');
    }
  }

  return (
    <div className="playlists-container">
      <PlaylistsStyles />
      <header className="create-playlist-header">
        <input
          type="text"
          className="primary-input"
          placeholder="Nom de la nouvelle playlist..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button className="primary-button" onClick={createPlaylist}>Créer</button>
      </header>

      {playlists.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Aucune playlist disponible.</p>
      ) : (
        <div className="playlists-grid">
          {playlists.map(pl => (
            <div key={pl._id} className="playlist-card">
              <h3 className="card-title">{pl.name}</h3>

              <h4 className="section-title">Tracks</h4>
              <ul className="item-list">
                {pl.tracks.map((t, i) => (
                  <li key={i} className="list-item">
                    <span>{t.title} – {t.artist}</span>
                    <button
                      className="delete-button"
                      onClick={() => API.delete(`/playlists/${pl._id}/tracks/${i}`, { headers: { Authorization: `Bearer ${token}` } }).then(fetchPlaylists)}
                      title="Supprimer le morceau"
                    >×</button>
                  </li>
                ))}
              </ul>
              <AddTrack playlistId={pl._id} refresh={fetchPlaylists} token={token} />

              <h4 className="section-title">Artistes Favoris</h4>
              <ul className="item-list">
                {pl.favorite_artists.map((a) => (
                  <li key={a} className="list-item">
                    <span>{a}</span>
                    <button
                      className="delete-button"
                      onClick={() => API.delete(`/playlists/${pl._id}/artists/${a}`, { headers: { Authorization: `Bearer ${token}` } }).then(fetchPlaylists)}
                      title="Supprimer l'artiste"
                    >×</button>
                  </li>
                ))}
              </ul>
              <AddArtist playlistId={pl._id} refresh={fetchPlaylists} token={token} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddTrack({ playlistId, refresh, token }) {
  const [track, setTrack] = useState({ title: '', artist: '' });

  async function addTrack() {
    if (!track.title.trim() || !track.artist.trim()) return;
    try {
      await API.post(`/playlists/${playlistId}/tracks`, track, { headers: { Authorization: `Bearer ${token}` } });
      setTrack({ title: '', artist: '' });
      refresh();
    } catch {
      alert("Erreur lors de l'ajout du track");
    }
  }

  return (
    <div className="add-item-form">
      <div className="add-item-inputs">
        <input
          className="secondary-input"
          placeholder="Titre"
          value={track.title}
          onChange={e => setTrack({ ...track, title: e.target.value })}
        />
        <input
          className="secondary-input"
          placeholder="Artiste"
          value={track.artist}
          onChange={e => setTrack({ ...track, artist: e.target.value })}
        />
      </div>
      <button className="secondary-button" onClick={addTrack}>Ajouter 🎵</button>
    </div>
  );
}

function AddArtist({ playlistId, refresh, token }) {
  const [artist, setArtist] = useState('');

  async function addArtist() {
    if (!artist.trim()) return;
    try {
      await API.post(`/playlists/${playlistId}/artists`, { artist }, { headers: { Authorization: `Bearer ${token}` } });
      setArtist('');
      refresh();
    } catch {
      alert("Erreur lors de l'ajout de l'artiste");
    }
  }

  return (
    <div className="add-item-form">
      <input
        className="secondary-input"
        placeholder="Artiste favori"
        value={artist}
        onChange={e => setArtist(e.target.value)}
      />
      <button className="secondary-button" onClick={addArtist}>Ajouter 👤</button>
    </div>
  );
}
