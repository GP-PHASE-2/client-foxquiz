
import './App.css'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import { MusicProvider } from './contexts/MusicContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MusicControls from './components/MusicControls';
import ThemeToggle from './components/ThemeToggle';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <ThemeProvider>
      <MusicProvider>
        <GameProvider>
          <div className="App">
            <MusicControls />
            <ThemeToggle />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/lobby/:roomCode" element={<LobbyPage />} />
              <Route path="/game/:roomCode" element={<GamePage />} />
              <Route path="/results/:roomCode" element={<ResultPage />} />
            </Routes>
          </div>
        </GameProvider>
      </MusicProvider>
    </ThemeProvider>
  );
}

export default App;
