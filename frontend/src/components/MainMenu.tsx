import React, { useState } from 'react';
import { useAuth } from '../util/AuthContext.tsx';
import LoginForm from './LoginForm.tsx';
import RegisterForm from './RegisterForm.tsx';
import * as Dialog from '@radix-ui/react-dialog';
import type { GameOptions } from '../types/chess';

interface MainMenuProps {
  onStartGame: (options: GameOptions) => void;
}

type AuthModalState = 'closed' | 'login' | 'register';
type InfoModalState = 'closed' | 'howToPlay' | 'settings' | 'botSkill';

const BOT_SKILLS: { label: string; skillLevel: number }[] = [
  { label: 'Easy', skillLevel: 0 },
  { label: 'Normal', skillLevel: 5 },
  { label: 'Hard', skillLevel: 10 },
  { label: 'Strong', skillLevel: 20 },
];

function MainMenu({ onStartGame }: MainMenuProps) {
  const { currentUser, logout, guestLogin, loading, isAuthenticated, isGuest } = useAuth();
  const [authModalState, setAuthModalState] = useState<AuthModalState>('closed');
  const [infoModalState, setInfoModalState] = useState<InfoModalState>('closed');

  const startGame = (options: GameOptions) => {
    onStartGame(options);
    if (!isAuthenticated) {
      void guestLogin();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <div className="user-info">
          <span className="username">Hello, {currentUser?.username}</span>
          {isGuest && <span className="guest-badge">Guest</span>}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      );
    }

    return (
      <div className="auth-buttons">
        <button onClick={() => setAuthModalState('login')} className="auth-btn login-btn">
          Login
        </button>
        <button onClick={() => setAuthModalState('register')} className="auth-btn register-btn">
          Register
        </button>
      </div>
    );
  };

  const AuthModal = () => (
    <Dialog.Root
      open={authModalState !== 'closed'}
      onOpenChange={(open) => !open && setAuthModalState('closed')}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          {authModalState === 'login' ? (
            <LoginForm
              onClose={() => setAuthModalState('closed')}
              onShowRegister={() => setAuthModalState('register')}
            />
          ) : (
            <RegisterForm
              onClose={() => setAuthModalState('closed')}
              onShowLogin={() => setAuthModalState('login')}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

  const InfoModal = () => (
    <Dialog.Root
      open={infoModalState !== 'closed'}
      onOpenChange={(open) => !open && setInfoModalState('closed')}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content info-modal">
          {infoModalState === 'howToPlay' && (
            <>
              <Dialog.Title className="info-title">How to Play</Dialog.Title>
              <ul className="info-list">
                <li>Left click a piece, then a highlighted square, to move.</li>
                <li>Right or middle drag orbits the camera. Mouse wheel zooms.</li>
                <li>Pause keeps the board mounted. Resume returns to the same position.</li>
                <li>A pawn that reaches the last rank opens a promotion chooser.</li>
                <li>Play vs Self flips the camera after each ply.</li>
                <li>Play vs Bot keeps the camera on White. The engine does not use the chooser.</li>
              </ul>
              <Dialog.Close asChild>
                <button className="secondary-btn">Close</button>
              </Dialog.Close>
            </>
          )}
          {infoModalState === 'settings' && (
            <>
              <Dialog.Title className="info-title">Settings</Dialog.Title>
              <p className="info-copy">
                Session controls only. Nothing is stored. Bot strength is chosen on Play vs Bot, not
                here.
              </p>
              <ul className="info-list">
                <li>Left click: select and move</li>
                <li>Right or middle drag: orbit</li>
                <li>Wheel: zoom</li>
                <li>Pause: overlay without resetting the board</li>
              </ul>
              <Dialog.Close asChild>
                <button className="secondary-btn">Close</button>
              </Dialog.Close>
            </>
          )}
          {infoModalState === 'botSkill' && (
            <>
              <Dialog.Title className="info-title">Play vs Bot</Dialog.Title>
              <p className="info-copy">You play White. Camera stays on the White side.</p>
              <div className="menu-buttons">
                {BOT_SKILLS.map((preset) => (
                  <button
                    key={preset.skillLevel}
                    className="primary-btn"
                    disabled={loading}
                    onClick={() => {
                      setInfoModalState('closed');
                      startGame({ mode: 'bot', skillLevel: preset.skillLevel });
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
                <Dialog.Close asChild>
                  <button className="secondary-btn">Cancel</button>
                </Dialog.Close>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

  return (
    <div className="main-menu">
      <div className="menu-header">
        <h1 className="game-title">Rustic Knights</h1>
        {renderAuthButtons()}
      </div>

      <div className="menu-buttons">
        <button
          onClick={() => startGame({ mode: 'hotseat' })}
          disabled={loading}
          className="primary-btn"
        >
          {loading ? 'Loading...' : 'Play vs Self'}
        </button>
        <button
          onClick={() => setInfoModalState('botSkill')}
          disabled={loading}
          className="primary-btn"
        >
          Play vs Bot
        </button>
        <button className="secondary-btn" onClick={() => setInfoModalState('settings')}>
          Settings
        </button>
        <button className="secondary-btn" onClick={() => setInfoModalState('howToPlay')}>
          How to Play
        </button>
      </div>

      <AuthModal />
      <InfoModal />
    </div>
  );
}

export default MainMenu;
