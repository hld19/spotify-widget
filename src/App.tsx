import { createContext } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Player from './components/Player';
import Settings from './components/Settings';
import { useTheme } from './hooks/useTheme';
import './App.css';

type ThemeContextType = {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function App() {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Router>
        <Routes>
          <Route path="/" element={<Player />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
