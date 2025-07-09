import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import API from '../api';
import './MostRepresentedGenre.css';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const genreColors = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
];

const defaultGenreData = [
  { genre: 'Pop', count: 12 },
  { genre: 'Rock', count: 9 },
  { genre: 'Hip-Hop', count: 7 },
  { genre: 'Jazz', count: 5 },
  { genre: 'Classical', count: 3 },
  { genre: 'Electronic', count: 2 },
  { genre: 'R&B', count: 2 },
  { genre: 'Reggae', count: 1 },
  { genre: 'Country', count: 1 },
  { genre: 'Metal', count: 1 }
];

const MostRepresentedGenre = () => {
  const [genreData, setGenreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch genre distribution from backend
    API.get('/reports/genre-distribution')
      .then(res => {
        setGenreData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des données.");
        setLoading(false);
      });
  }, []);

  const data = {
    labels: (genreData.length > 0 ? genreData : defaultGenreData).map(g => g.genre),
    datasets: [
      {
        label: "Nombre d'artistes",
        data: (genreData.length > 0 ? genreData : defaultGenreData).map(g => g.count),
        backgroundColor: genreColors,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#222', font: { size: 16 } } },
      x: { ticks: { color: '#222', font: { size: 16 } } },
    },
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Quel est le genre musical le plus représenté parmi les artistes ?</h2>
      {loading ? (
        <div className="dashboard-loading">Chargement...</div>
      ) : error ? (
        <div className="dashboard-error">{error}</div>
      ) : (
        <div className="dashboard-chart">
          <Bar data={data} options={options} />
        </div>
      )}
    </div>
  );
};

export default MostRepresentedGenre;
