import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Player from './components/Player';
import Settings from './components/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Player />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
