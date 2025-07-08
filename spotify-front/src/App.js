import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Playlists from './pages/Playlists';
import SpotifySearch from './pages/SpotifySearch'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/spotify" element={<SpotifySearch />} />
      </Routes>
    </Router>
  );
}

export default App;
