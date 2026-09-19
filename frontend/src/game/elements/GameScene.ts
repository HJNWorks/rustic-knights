import * as BABYLON from '@babylonjs/core';

import { Board } from './Board';
import { setCurrentTurn } from './Piece';
import { ChessGame } from '../rules/ChessGame';
import { Position, PromotionRole, SquareHighlightState } from '../../types/chess';

export interface GameState {
  currentTurn: 'white' | 'black';
  turnCount: number;
  timeElapsed: number;
  whiteScore: number;
  blackScore: number;
}

export type GameStateUpdateCallback = (gameState: GameState) => void;

export interface GameSceneHooks {
  onGameStateUpdate?: GameStateUpdateCallback;
  onPromotionNeeded?: (from: Position, to: Position) => void;
  onGameOver?: (result: string) => void;
}

export class GameScene {
  private scene: BABYLON.Scene;
  private engine: BABYLON.Engine;
  private canvas: HTMLCanvasElement;
  private board!: Board;
  private chessGame: ChessGame;
  private selectedPiece: BABYLON.AbstractMesh | null = null;
  private onGameStateUpdate: GameStateUpdateCallback | null = null;
  private onPromotionNeeded: ((from: Position, to: Position) => void) | null = null;
  private onGameOver: ((result: string) => void) | null = null;
  private fpsElement: HTMLDivElement | null = null;
  private paused = false;
  private interactionLocked = false;
  private pendingPromotion: { from: Position; to: Position } | null = null;
  private gameState: GameState = {
    currentTurn: 'white',
    turnCount: 1,
    timeElapsed: 0,
    whiteScore: 0,
    blackScore: 0,
  };

  constructor(engine: BABYLON.Engine, canvas: HTMLCanvasElement, fen?: string) {
    this.engine = engine;
    this.canvas = canvas;
    this.scene = this.createScene();
    this.board = new Board(this.scene);

    if (!this.scene.metadata) {
      this.scene.metadata = {};
    }
    this.scene.metadata.board = this.board;

    this.chessGame = new ChessGame(fen);
    if (fen) {
      this.board.replaceAllPieces(this.chessGame.placedPieces());
    }
    this.updateGameState({
      currentTurn: this.chessGame.getCurrentTurn(),
      turnCount: 1,
    });
    this.setupEventHandlers();
    this.setupFPSDisplay();
  }

  public setHooks(hooks: GameSceneHooks): void {
    if (hooks.onGameStateUpdate) {
      this.onGameStateUpdate = hooks.onGameStateUpdate;
      this.onGameStateUpdate(this.gameState);
    }
    if (hooks.onPromotionNeeded) {
      this.onPromotionNeeded = hooks.onPromotionNeeded;
    }
    if (hooks.onGameOver) {
      this.onGameOver = hooks.onGameOver;
      const outcome = this.chessGame.outcome();
      if (outcome) {
        this.interactionLocked = true;
        this.onGameOver(outcome);
      }
    }
  }

  public setPaused(paused: boolean): void {
    this.paused = paused;
    if (paused) {
      this.cancelSelection();
    }
  }

  public completePromotion(role: PromotionRole): void {
    if (!this.pendingPromotion) {
      return;
    }
    const { from, to } = this.pendingPromotion;
    this.pendingPromotion = null;
    this.interactionLocked = false;
    this.commitMove(from, to, role);
  }

  public getScene(): BABYLON.Scene {
    return this.scene;
  }

  public getFPSElement(): HTMLDivElement | null {
    return this.fpsElement;
  }

  public setGameStateUpdateCallback(callback: GameStateUpdateCallback): void {
    this.onGameStateUpdate = callback;
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  private updateGameState(partialState: Partial<GameState>): void {
    this.gameState = {
      ...this.gameState,
      ...partialState,
    };

    if (this.onGameStateUpdate) {
      this.onGameStateUpdate(this.gameState);
    }
  }

  private createScene(): BABYLON.Scene {
    const scene = new BABYLON.Scene(this.engine);
    this.setupCamera(scene);
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 10, 0), scene);
    light.intensity = 0.7;
    scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.3, 1);
    return scene;
  }

  private resolvePieceMesh(mesh: BABYLON.AbstractMesh): BABYLON.AbstractMesh {
    if (this.board.isPiece(mesh)) {
      return mesh;
    }
    if (mesh.parent && this.board.isPiece(mesh.parent as BABYLON.AbstractMesh)) {
      return mesh.parent as BABYLON.AbstractMesh;
    }
    return mesh;
  }

  private handlePieceSelection(mesh: BABYLON.AbstractMesh): void {
    this.board.clearAllHighlights();

    if (this.selectedPiece) {
      this.cancelSelection();
    }

    const squarePos = this.board.getSquarePositionFromPieceMesh(mesh);
    const pieceColor = this.board.getPieceColorFromMesh(mesh);

    if (!squarePos || !pieceColor || pieceColor !== this.chessGame.getCurrentTurn()) {
      return;
    }

    this.selectedPiece = mesh;
    const dests = this.chessGame.legalDests(squarePos);
    this.board.highlightValidMovesFromPosition(squarePos, dests);
  }

  private handleSquareSelection(mesh: BABYLON.AbstractMesh): void {
    if (!this.selectedPiece) {
      return;
    }

    const fromSquarePos = this.board.getSquarePosition(this.selectedPiece);
    const toSquarePos = this.board.getSquarePosition(mesh);

    if (!fromSquarePos || !toSquarePos) {
      this.cancelSelection();
      return;
    }

    const toSquare = this.board.getSquare(toSquarePos);
    if (!toSquare) {
      this.cancelSelection();
      return;
    }

    const isValidMoveSquare = this.board.isValidMoveSquare(toSquarePos);
    const isEndangeredSquare = toSquare.getHighlightState() === SquareHighlightState.ENDANGERED;
    if (!isValidMoveSquare && !isEndangeredSquare) {
      this.cancelSelection();
      return;
    }

    this.tryMove(fromSquarePos, toSquarePos);
  }

  private tryMove(from: Position, to: Position, promotion?: PromotionRole): void {
    if (this.chessGame.needsPromotion(from, to) && !promotion) {
      this.pendingPromotion = { from, to };
      this.interactionLocked = true;
      this.board.clearAllHighlights();
      if (this.onPromotionNeeded) {
        this.onPromotionNeeded(from, to);
      } else {
        this.commitMove(from, to, 'queen');
      }
      return;
    }
    this.commitMove(from, to, promotion);
  }

  private commitMove(from: Position, to: Position, promotion?: PromotionRole): void {
    const result = this.chessGame.play(from, to, promotion);
    if (!result.valid || !result.flags) {
      this.cancelSelection();
      return;
    }

    const capturedType = this.board.applyLegalMove(from, to, result.flags);
    if (capturedType) {
      const value = this.getPieceValue(capturedType);
      if (this.gameState.currentTurn === 'white') {
        this.updateGameState({ whiteScore: this.gameState.whiteScore + value });
      } else {
        this.updateGameState({ blackScore: this.gameState.blackScore + value });
      }
    }

    const newTurn = this.chessGame.getCurrentTurn();
    const isNewTurn = newTurn !== this.gameState.currentTurn;
    this.updateGameState({
      currentTurn: newTurn,
      turnCount:
        isNewTurn && newTurn === 'white' ? this.gameState.turnCount + 1 : this.gameState.turnCount,
    });

    this.board.clearAllHighlights();
    this.board.highlightLastMove(from, to);
    if (this.chessGame.isCheck()) {
      this.board.highlightKingInCheck(newTurn);
    }

    if (isNewTurn) {
      this.flipCamera();
    }
    setCurrentTurn(newTurn);
    this.selectedPiece = null;

    if (result.outcome && this.onGameOver) {
      this.interactionLocked = true;
      this.onGameOver(result.outcome);
    }
  }

  private getPieceValue(pieceType: string): number {
    switch (pieceType.toLowerCase()) {
      case 'pawn':
        return 1;
      case 'knight':
        return 3;
      case 'bishop':
        return 3;
      case 'rook':
        return 5;
      case 'queen':
        return 9;
      default:
        return 0;
    }
  }

  private cancelSelection(): void {
    this.board.clearAllHighlights();
    this.selectedPiece = null;
  }

  private setupEventHandlers(): void {
    this.scene.onPointerDown = (_evt, pickInfo) => {
      if (this.paused || this.interactionLocked || this.chessGame.isEnded()) {
        return;
      }
      if (!pickInfo?.hit) {
        this.cancelSelection();
        return;
      }
      if (!pickInfo.pickedMesh) {
        return;
      }
      const pickedMesh = this.resolvePieceMesh(pickInfo.pickedMesh);
      if (pickedMesh.name === 'ground' || pickedMesh.name.startsWith('extended_')) {
        this.cancelSelection();
        return;
      }
      if (this.board.isPiece(pickedMesh)) {
        const pos = this.board.getSquarePosition(pickedMesh);
        const color = this.board.getPieceColorFromMesh(pickedMesh);
        if (this.selectedPiece && pos && color && color !== this.chessGame.getCurrentTurn()) {
          const square = this.board.getSquare(pos);
          if (square) {
            this.handleSquareSelection(square.getMesh());
            return;
          }
        }
        this.handlePieceSelection(pickedMesh);
      } else {
        this.handleSquareSelection(pickedMesh);
      }
    };
  }

  private setupCamera(scene: BABYLON.Scene): void {
    const whiteCamera = new BABYLON.ArcRotateCamera(
      'WhiteCamera',
      Math.PI / 2,
      Math.PI / 3,
      12,
      BABYLON.Vector3.Zero(),
      scene
    );
    whiteCamera.setPosition(new BABYLON.Vector3(0, 8, -12));
    whiteCamera.lowerRadiusLimit = 8;
    whiteCamera.upperRadiusLimit = 20;
    whiteCamera.lowerBetaLimit = 0.1;
    whiteCamera.upperBetaLimit = Math.PI / 2.2;
    whiteCamera.lowerAlphaLimit = Math.PI;
    whiteCamera.upperAlphaLimit = 2 * Math.PI;

    const blackCamera = new BABYLON.ArcRotateCamera(
      'BlackCamera',
      Math.PI / 2,
      Math.PI / 3,
      12,
      BABYLON.Vector3.Zero(),
      scene
    );
    blackCamera.setPosition(new BABYLON.Vector3(0, 8, 12));
    blackCamera.lowerRadiusLimit = 8;
    blackCamera.upperRadiusLimit = 20;
    blackCamera.lowerBetaLimit = 0.1;
    blackCamera.upperBetaLimit = Math.PI / 2.2;
    blackCamera.lowerAlphaLimit = 0;
    blackCamera.upperAlphaLimit = Math.PI;

    whiteCamera.attachControl(this.canvas, true);
    scene.activeCamera = whiteCamera;

    if (!scene.metadata) {
      scene.metadata = {};
    }
    scene.metadata.whiteCamera = whiteCamera;
    scene.metadata.blackCamera = blackCamera;
    scene.metadata.currentCamera = 'white';
  }

  private flipCamera(): void {
    if (!this.scene.metadata) {
      return;
    }

    const whiteCamera = this.scene.metadata.whiteCamera as BABYLON.ArcRotateCamera;
    const blackCamera = this.scene.metadata.blackCamera as BABYLON.ArcRotateCamera;
    const currentCamera = this.scene.metadata.currentCamera;

    if (!whiteCamera || !blackCamera) {
      return;
    }

    if (this.scene.activeCamera) {
      (this.scene.activeCamera as BABYLON.ArcRotateCamera).detachControl();
    }

    if (currentCamera === 'white') {
      this.scene.activeCamera = blackCamera;
      blackCamera.attachControl(this.canvas, true);
      this.scene.metadata.currentCamera = 'black';
    } else {
      this.scene.activeCamera = whiteCamera;
      whiteCamera.attachControl(this.canvas, true);
      this.scene.metadata.currentCamera = 'white';
    }
  }

  private setupFPSDisplay(): void {
    const fpsDisplay = document.createElement('div');
    fpsDisplay.style.position = 'static';
    fpsDisplay.style.color = 'white';
    fpsDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    fpsDisplay.style.padding = '0.5rem 1rem';
    fpsDisplay.style.borderRadius = '4px';
    fpsDisplay.style.fontFamily = 'monospace';
    fpsDisplay.style.fontWeight = 'bold';
    fpsDisplay.style.marginRight = '1rem';
    fpsDisplay.className = 'fps-counter';

    this.engine.onEndFrameObservable.add(() => {
      fpsDisplay.textContent = `FPS: ${this.engine.getFps().toFixed(0)}`;
    });

    this.fpsElement = fpsDisplay;
  }
}

export const createGameScene = (
  engine: BABYLON.Engine,
  canvas: HTMLCanvasElement,
  hooks?: GameSceneHooks,
  fen?: string
): BABYLON.Scene => {
  const gameScene = new GameScene(engine, canvas, fen);
  if (hooks) {
    gameScene.setHooks(hooks);
  }

  const scene = gameScene.getScene();
  if (!scene.metadata) {
    scene.metadata = {};
  }
  scene.metadata.gameSceneInstance = gameScene;

  return scene;
};
