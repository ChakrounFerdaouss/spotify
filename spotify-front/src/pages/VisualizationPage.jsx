import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BACKEND_URL = 'http://127.0.0.1:5000';

export default function VisualizationPage() {
  const [topArtistsChart, setTopArtistsChart] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token');

        const topArtistsRes = await fetch(`${BACKEND_URL}/reports/top-artists-chart`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!topArtistsRes.ok) throw new Error('Failed to fetch top artists chart');

        const topArtistsData = await topArtistsRes.json();
        setTopArtistsChart(topArtistsData);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, []);

  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  if (!topArtistsChart) return <div style={{ textAlign: 'center' }}>Loading...</div>;

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

  const topArtistsData = {
    labels: topArtistsChart.labels,
    datasets: [
      {
        label: 'Top Artists (Play Count)',
        data: topArtistsChart.data,
        backgroundColor: colors.slice(0, topArtistsChart.data.length),
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
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 40 }}>Your Listening Stats</h1>

      <section>
        <h2>Top Artists (Mongo Aggregation)</h2>
        <Bar data={topArtistsData} options={options} />
      </section>
    </div>
  );
}
