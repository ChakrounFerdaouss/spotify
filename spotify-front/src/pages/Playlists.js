import { useState, useEffect } from 'react';
import API from '../api';

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState('');
  const token = localStorage.getItem('token');  // récupère le token stocké

  // Fonction pour récupérer les playlists avec token dans header
  const getPlaylists = async () => {
    try {
      const res = await API.get('/playlists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(res.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la récupération des playlists');
    }
  };

  const createPlaylist = async () => {
    try {
      await API.post('/playlists', { name: newName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewName('');
      getPlaylists();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la création de la playlist');
    }
  };

  useEffect(() => {
    if (token) {
      getPlaylists();
    } else {
      alert('Connecte-toi d’abord !');
    }
  }, [token]);

  return (
    <div>
      <h2>Mes Playlists</h2>
      <input
        placeholder="Nom playlist"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <button onClick={createPlaylist}>Créer</button>

      {playlists.map((pl) => (
        <div key={pl._id}>
          <h3>{pl.name}</h3>
          <ul>
            {pl.tracks.map((t, i) => (
              <li key={i}>
                🎵 {t.title} – {t.artist}
                <button onClick={() => {
                  API.delete(`/playlists/${pl._id}/tracks/${i}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  }).then(getPlaylists);
                }}>Supprimer</button>
              </li>
            ))}
          </ul>
          <AddTrack playlistId={pl._id} refresh={getPlaylists} token={token} />
          <h4>Artistes favoris</h4>
          <ul>
            {pl.favorite_artists.map((a) => (
              <li key={a}>
                {a}
                <button onClick={() => {
                  API.delete(`/playlists/${pl._id}/artists/${a}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  }).then(getPlaylists);
                }}>❌</button>
              </li>
            ))}
          </ul>
          <AddArtist playlistId={pl._id} refresh={getPlaylists} token={token} />
        </div>
      ))}
    </div>
  );
}

function AddTrack({ playlistId, refresh, token }) {
  const [track, setTrack] = useState({ title: '', artist: '' });
  return (
    <div>
      <input
        placeholder="Titre"
        value={track.title}
        onChange={(e) => setTrack({ ...track, title: e.target.value })}
      />
      <input
        placeholder="Artiste"
        value={track.artist}
        onChange={(e) => setTrack({ ...track, artist: e.target.value })}
      />
      <button onClick={async () => {
        try {
          await API.post(`/playlists/${playlistId}/tracks`, track, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTrack({ title: '', artist: '' });
          refresh();
        } catch {
          alert("Erreur lors de l'ajout du track");
        }
      }}>Ajouter 🎵</button>
    </div>
  );
}

function AddArtist({ playlistId, refresh, token }) {
  const [artist, setArtist] = useState('');
  return (
    <div>
      <input
        placeholder="Artiste favori"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      />
      <button onClick={async () => {
        try {
          await API.post(`/playlists/${playlistId}/artists`, { artist }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setArtist('');
          refresh();
        } catch {
          alert("Erreur lors de l'ajout de l'artiste");
        }
      }}>Ajouter 👤</button>
    </div>
  );
}