import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrackTrendStyles = () => (
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
    .track-trend-container {
      background-color: var(--dark-bg);
      color: var(--text-light);
      font-family: 'Montserrat', sans-serif;
      max-width: 900px;     /* plus large */
      margin: 2rem auto;
      padding: 2rem 3rem;   /* plus de padding */
      border-radius: 12px;
      box-shadow: 0 0 15px var(--glow-purple);
    }
    .track-trend-title {
      font-family: 'Fredoka One', cursive;
      font-size: 2.5rem;    /* plus grand */
      margin-bottom: 1rem;
      color: var(--glow-purple);
      text-align: center;
      text-shadow: 0 0 10px var(--glow-purple);
    }
    .trend-text {
      margin-top: 1.5rem;
      font-weight: 700;
      font-size: 1.3rem;   /* un peu plus grand */
      text-align: center;
    }
    .trend-text.augmentation {
      color: rgba(75, 192, 192, 0.9);
    }
    .trend-text.diminution {
      color: rgba(255, 99, 132, 0.9);
    }
    .trend-text.stable {
      color: rgba(201, 203, 207, 0.9);
    }
    .trend-text.unavailable {
      font-style: italic;
      color: var(--text-gray);
    }
  `}</style>
);

const TrackTrendChart = ({ trackId }) => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!trackId) return;

    const fetchTrendData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:5000/spotify/track-trend?track_id=${trackId}`
        );

        if (!response.ok) {
          throw new Error(`Erreur API : ${response.status}`);
        }

        const data = await response.json();
        setTrendData(data);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        setError("Erreur lors du chargement des données de tendance.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [trackId]);

  if (!trackId) return <p>Sélectionne un morceau pour voir la tendance.</p>;
  if (loading) return <p>Chargement des données...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!trendData) return null;

  const history = Array.isArray(trendData.history) ? trendData.history : [];

  const getTrendColor = (trend) => {
    switch (trend) {
      case "augmentation":
        return "rgba(75, 192, 192, 0.9)"; // turquoise
      case "diminution":
        return "rgba(255, 99, 132, 0.9)"; // rouge clair
      case "stable":
        return "rgba(201, 203, 207, 0.9)"; // gris clair
      default:
        return "rgba(201, 203, 207, 0.9)";
    }
  };

  const trendColor = getTrendColor(trendData.trend);

  const chartData = {
    labels: history.map((entry) =>
      new Date(entry.date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      })
    ),
    datasets: [
      {
        label: "Popularité",
        data: history.map((entry) => entry.popularity),
        borderColor: trendColor,
        backgroundColor: trendColor.replace("0.9", "0.25"),
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: trendColor,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000,
    easing: "easeOutQuart",
  },
  layout: {
    padding: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    },
  },
  plugins: {
    legend: {
      display: true,
      position: "top",
      labels: {
        color: "white", // couleur blanche
        font: { size: 16, weight: "bold" },
      },
    },
    title: {
      display: true,
      text: "Tendance de la popularité du morceau",
      font: { size: 24, weight: "bold" },
      color: "white", // couleur blanche
      padding: {
        top: 10,
        bottom: 30,
      },
    },
    tooltip: {
      enabled: true,
      mode: "nearest",
      intersect: false,
      backgroundColor: "#222",
      titleFont: { size: 16, weight: "bold" },
      bodyFont: { size: 14 },
      cornerRadius: 6,
      titleColor: "white", // couleur blanche
      bodyColor: "white",  // couleur blanche
      callbacks: {
        label: (context) => `Popularité : ${context.parsed.y} / 100`,
        title: (context) => `Date : ${context[0].label}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 10,
        color: "white", // couleur blanche
        font: { size: 14, weight: "bold" },
      },
      title: {
        display: true,
        text: "Popularité (0-100)",
        font: { size: 16, weight: "bold" },
        color: "white", // couleur blanche
      },
      grid: {
        color: "#444",
      },
    },
    x: {
      title: {
        display: true,
        text: "Date",
        font: { size: 16, weight: "bold" },
        color: "white", // couleur blanche
      },
      grid: {
        color: "#333",
      },
      ticks: {
        color: "white", // couleur blanche
        font: { size: 14, weight: "bold" },
      },
    },
  },
};


  return (
    <>
      <TrackTrendStyles />
      <div className="track-trend-container" style={{ height: "450px" }}>
        {history.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p>Aucune donnée de popularité disponible pour ce morceau.</p>
        )}

        {trendData.trend ? (
          <p className={`trend-text ${trendData.trend}`}>
            Tendance : {trendData.trend.charAt(0).toUpperCase() + trendData.trend.slice(1)}
          </p>
        ) : (
          <p className="trend-text unavailable">
            Tendance non disponible ou insuffisante.
          </p>
        )}
      </div>
    </>
  );
};

export default TrackTrendChart;
