/**
 * 🎵 Spotify Widget App - Completely Revamped
 * Clean, beautiful, and bulletproof main application
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Player from './components/Player';
import Settings from './components/Settings';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';

export default function App() {
  return (
    <NotificationProvider>
    <div className="w-full h-full">
      <Router>
        <Routes>
          <Route path="/" element={<Player />} />
          <Route path="/player" element={<Player />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </div>
    </NotificationProvider>
  );
}
