import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { createGameScene, GameScene, GameState } from '../game/elements/GameScene';
import type { Position, PromotionRole } from '../types/chess';
import { consumeFenParam } from '../util/fenQuery';

interface GameViewProps {
  onPause: () => void;
  onMainMenu: () => void;
  paused?: boolean;
}

function GameView({ onPause, onMainMenu, paused = false }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameSceneRef = useRef<GameScene | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>({
    currentTurn: 'white',
    turnCount: 1,
    timeElapsed: 0,
    whiteScore: 0,
    blackScore: 0,
  });
  const [promotion, setPromotion] = useState<{ from: Position; to: Position } | null>(null);
  const [gameOver, setGameOver] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const fen = consumeFenParam();
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = createGameScene(
      engine,
      canvasRef.current,
      {
        onGameStateUpdate: (newState) =>
          setGameState((prevState) => ({
            ...prevState,
            ...newState,
            timeElapsed: prevState.timeElapsed,
          })),
        onPromotionNeeded: (from, to) => setPromotion({ from, to }),
        onGameOver: (result) => setGameOver(result),
      },
      fen
    );
    gameSceneRef.current = scene.metadata.gameSceneInstance as GameScene;

    const timer = window.setInterval(() => {
      setGameState((prevState) => ({
        ...prevState,
        timeElapsed: prevState.timeElapsed + 1,
      }));
    }, 1000);

    const fpsInterval = window.setInterval(() => {
      setFps(engine.getFps());
    }, 500);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.clearInterval(timer);
      window.clearInterval(fpsInterval);
      engine.dispose();
      gameSceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    gameSceneRef.current?.setPaused(paused);
  }, [paused]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const choosePromotion = (role: PromotionRole) => {
    gameSceneRef.current?.completePromotion(role);
    setPromotion(null);
  };

  const outcomeLabel = (result: string): string => {
    if (result === '1-0') return 'White wins';
    if (result === '0-1') return 'Black wins';
    return 'Draw';
  };

  return (
    <div className="game-view">
      <div className="game-ui">
        <div className="game-info">
          <div className="turn-info">
            <span>Turn: {gameState.turnCount}</span>
            <span className={`current-player ${gameState.currentTurn}`}>
              {gameState.currentTurn.charAt(0).toUpperCase() + gameState.currentTurn.slice(1)}'s
              Turn
            </span>
          </div>
          <div className="timer">Time: {formatTime(gameState.timeElapsed)}</div>
          <div className="score">
            <span className="white-score">White: {gameState.whiteScore}</span>
            <span className="black-score">Black: {gameState.blackScore}</span>
          </div>
        </div>
        <div className="controls">
          <div className="fps-counter">FPS: {Math.round(fps)}</div>
          <button className="pause-button" onClick={onPause}>
            Pause
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} id="renderCanvas" />
      {promotion && (
        <div className="overlay-layer">
          <div className="game-overlay">
            <h2>Promote pawn</h2>
            <div className="menu-buttons">
              <button className="primary-btn" onClick={() => choosePromotion('queen')}>
                Queen
              </button>
              <button className="secondary-btn" onClick={() => choosePromotion('rook')}>
                Rook
              </button>
              <button className="secondary-btn" onClick={() => choosePromotion('bishop')}>
                Bishop
              </button>
              <button className="secondary-btn" onClick={() => choosePromotion('knight')}>
                Knight
              </button>
            </div>
          </div>
        </div>
      )}
      {gameOver && (
        <div className="overlay-layer">
          <div className="game-overlay">
            <h2>Game over</h2>
            <p>
              {outcomeLabel(gameOver)} ({gameOver})
            </p>
            <button className="primary-btn" onClick={onMainMenu}>
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameView;
