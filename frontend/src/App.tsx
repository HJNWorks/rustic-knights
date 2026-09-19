import React, { useState } from 'react';
import GameView from './components/GameView.tsx';
import MainMenu from './components/MainMenu.tsx';
import PauseMenu from './components/PauseMenu.tsx';
import { AuthProvider } from './util/AuthContext.tsx';
import './App.css';

type AppScreen = 'menu' | 'playing' | 'paused';

function App() {
  const [gameState, setGameState] = useState<AppScreen>('menu');

  const handlePause = () => {
    setGameState('paused');
  };

  const handleResume = () => {
    setGameState('playing');
  };

  const handleMainMenu = () => {
    setGameState('menu');
  };

  return (
    <AuthProvider>
      <div className="app">
        {gameState === 'menu' && <MainMenu onStartGame={() => setGameState('playing')} />}
        {(gameState === 'playing' || gameState === 'paused') && (
          <GameView
            onPause={handlePause}
            onMainMenu={handleMainMenu}
            paused={gameState === 'paused'}
          />
        )}
        {gameState === 'paused' && (
          <div className="overlay-layer">
            <PauseMenu onResume={handleResume} onMainMenu={handleMainMenu} />
          </div>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
