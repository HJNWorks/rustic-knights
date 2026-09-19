import React, { useState } from 'react';
import GameView from './components/GameView.tsx';
import MainMenu from './components/MainMenu.tsx';
import PauseMenu from './components/PauseMenu.tsx';
import { AuthProvider } from './util/AuthContext.tsx';
import { stripFenParam } from './util/fenQuery';
import type { GameOptions } from './types/chess';
import './App.css';

type AppScreen = 'menu' | 'playing' | 'paused';

function App() {
  const [gameState, setGameState] = useState<AppScreen>('menu');
  const [gameOptions, setGameOptions] = useState<GameOptions>({ mode: 'hotseat' });

  const handlePause = () => {
    setGameState('paused');
  };

  const handleResume = () => {
    setGameState('playing');
  };

  const handleMainMenu = () => {
    stripFenParam();
    setGameState('menu');
  };

  return (
    <AuthProvider>
      <div className="app">
        {gameState === 'menu' && (
          <MainMenu
            onStartGame={(options) => {
              setGameOptions(options);
              setGameState('playing');
            }}
          />
        )}
        {(gameState === 'playing' || gameState === 'paused') && (
          <GameView
            onPause={handlePause}
            onMainMenu={handleMainMenu}
            paused={gameState === 'paused'}
            gameOptions={gameOptions}
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
