import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Playlists from './pages/Playlists';
import SpotifySearch from './pages/SpotifySearch'
import MostRepresentedGenre from './pages/MostRepresentedGenre';
import ArtistSearch from './pages/ArtistSearch';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/spotify" element={<SpotifySearch />} />
        <Route path="/most-represented-genre" element={<MostRepresentedGenre />} />
        <Route path="/rapport" element={<ArtistSearch />} />
      </Routes>
    </Router>
  );
}

export default App;
