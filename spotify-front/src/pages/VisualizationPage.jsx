import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Tooltip, Legend
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const BACKEND_URL = 'http://127.0.0.1:5000';

export default function VisualizationPage() {
  const [albumStreams, setAlbumStreams] = useState(null);
  const [trendStreams, setTrendStreams] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token');  // Get token from localStorage

        const [albumsRes, trendsRes, playlistsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/spotify/albums/streams`),
          fetch(`${BACKEND_URL}/spotify/trends/streams`),
          fetch(`${BACKEND_URL}/playlists`, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          })
        ]);

        if (!albumsRes.ok) throw new Error('Failed to fetch album streams data');
        if (!trendsRes.ok) throw new Error('Failed to fetch trend streams data');
        if (!playlistsRes.ok) throw new Error('Failed to fetch playlists');

        const albumsData = await albumsRes.json();
        const trendsData = await trendsRes.json();
        const playlistsData = await playlistsRes.json();

        setAlbumStreams(albumsData);
        setTrendStreams(trendsData);
        setPlaylists(playlistsData);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, []);

  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  if (!albumStreams || !trendStreams || !playlists) return <div style={{ textAlign: 'center' }}>Loading...</div>;

  // Map playlist IDs to names for trend chart labels
  const playlistIdToName = {};
  playlists.forEach(pl => {
    playlistIdToName[pl._id] = pl.name || "Unnamed Playlist";
  });
  const trendLabelsWithNames = trendStreams.labels.map(id => playlistIdToName[id] || id);

  // Prepare data for album streams line chart
  const albumChartData = {
    labels: albumStreams.dates,
    datasets: albumStreams.albums.map((album, idx) => ({
      label: album.name,
      data: album.streams,
      borderColor: album.color || `hsl(${idx * 60}, 70%, 50%)`,
      backgroundColor: album.color || `hsl(${idx * 60}, 70%, 50%, 0.5)`,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
    })),
  };

  // Prepare data for playlist streams bar chart with real playlist names
  const trendChartData = {
    labels: trendLabelsWithNames,
    datasets: [
      {
        label: 'Streams per Playlist',
        data: trendStreams.streamCounts,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
  };

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: 'auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 40 }}>Spotify Data Visualizations</h1>

      <section>
        <h2>Album Streams Over Time</h2>
        <Line data={albumChartData} options={options} />
      </section>

      <section style={{ marginTop: 40 }}>
        <h2>Playlist Stream Counts</h2>
        <Bar data={trendChartData} options={options} />
      </section>

      {/* Add additional charts if you want */}
    </div>
  );
}
