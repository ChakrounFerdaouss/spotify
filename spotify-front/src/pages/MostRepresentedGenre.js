import React, { useEffect, useState } from 'react';
// import axios from '../api'; // Uncomment and adjust if you have an API endpoint

const MostRepresentedGenre = () => {
  const [genre, setGenre] = useState('');
  const [count, setCount] = useState(0);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example fetch logic (replace with your real API call)
    // axios.get('/api/most-represented-genre').then(res => {
    //   setGenre(res.data.genre);
    //   setCount(res.data.count);
    //   setLoading(false);
    // });
    // Mocked data for now:
    setGenre('Pop');
    setCount(42);
    // setLoading(false);
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Quel est le genre musical le plus représenté parmi les artistes ?</h1>
      {/* {loading ? <p>Chargement...</p> : ( */}
        <div style={{ marginTop: '2rem', fontSize: '1.5rem' }}>
          <strong>Genre le plus représenté :</strong> {genre} <br />
          <strong>Nombre d'artistes :</strong> {count}
        </div>
      {/* )} */}
    </div>
  );
};

export default MostRepresentedGenre;
