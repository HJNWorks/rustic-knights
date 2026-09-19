import * as BABYLON from '@babylonjs/core';

import { Board } from './Board';
import { setCurrentTurn } from './Piece';
import { ChessGame } from '../rules/ChessGame';
import { Position, PromotionRole, GameOptions, MoveResult } from '../../types/chess';
import { BOARD_OFFSET, BOARD_SIZE } from '../../util/constants';
import { animateNumber, CAMERA_ANIMATION_FRAMES, shortestAngleTo } from '../rendering/tween';
import { StockfishEngine } from '../engine/StockfishEngine';

export interface GameState {
  currentTurn: 'white' | 'black';
  turnCount: number;
  timeElapsed: number;
  whiteScore: number;
  blackScore: number;
  botThinking: boolean;
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
  private animating = false;
  private pendingPromotion: { from: Position; to: Position } | null = null;
  private playMode: GameOptions['mode'] = 'hotseat';
  private skillLevel = 5;
  private stockfish: StockfishEngine | null = null;
  private disposed = false;
  private whiteCameraDefaults = { alpha: 0, beta: 0, radius: 0 };
  private blackCameraDefaults = { alpha: 0, beta: 0, radius: 0 };
  private gameState: GameState = {
    currentTurn: 'white',
    turnCount: 1,
    timeElapsed: 0,
    whiteScore: 0,
    blackScore: 0,
    botThinking: false,
  };

  constructor(
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement,
    fen?: string,
    options?: GameOptions
  ) {
    this.engine = engine;
    this.canvas = canvas;
    this.playMode = options?.mode ?? 'hotseat';
    this.skillLevel = options?.skillLevel ?? 5;
    this.scene = this.createScene();
    this.board = new Board(this.scene);

    if (!this.scene.metadata) {
      this.scene.metadata = {};
    }
    this.scene.metadata.board = this.board;

    this.chessGame = new ChessGame(fen);
    this.board.replaceAllPieces(this.chessGame.placedPieces());
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
    if (this.playMode === 'bot') {
      void this.maybeRequestBotMove();
    }
  }

  public dispose(): void {
    this.disposed = true;
    this.stockfish?.dispose();
    this.stockfish = null;
    this.scene.onPointerDown = undefined;
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
    void this.commitMove(from, to, role);
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

    const dests = this.chessGame.legalDests(fromSquarePos);
    const isLegal = dests.some((dest) => dest.x === toSquarePos.x && dest.y === toSquarePos.y);
    if (!isLegal) {
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
        void this.commitMove(from, to, 'queen');
      }
      return;
    }
    void this.commitMove(from, to, promotion);
  }

  private async commitMove(from: Position, to: Position, promotion?: PromotionRole): Promise<void> {
    const result = this.chessGame.play(from, to, promotion);
    await this.presentMove(result);
    if (this.playMode === 'bot') {
      void this.maybeRequestBotMove();
    }
  }

  private async presentMove(result: MoveResult): Promise<void> {
    if (!result.valid || !result.flags || !result.from || !result.to) {
      this.cancelSelection();
      return;
    }

    const from = result.from;
    const to = result.to;
    this.animating = true;
    this.selectedPiece = null;
    this.board.clearAllHighlights();

    try {
      const capturedType = await this.board.applyLegalMove(from, to, result.flags);
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
          isNewTurn && newTurn === 'white'
            ? this.gameState.turnCount + 1
            : this.gameState.turnCount,
      });

      this.board.highlightLastMove(from, to);
      if (this.chessGame.isCheck()) {
        this.board.highlightKingInCheck(newTurn);
      }

      if (isNewTurn && this.playMode === 'hotseat') {
        await this.flipCamera();
      }
      setCurrentTurn(newTurn);

      if (result.outcome && this.onGameOver) {
        this.interactionLocked = true;
        this.onGameOver(result.outcome);
      }
    } finally {
      this.animating = false;
    }
    if (this.playMode === 'bot') {
      void this.maybeRequestBotMove();
    }
  }

  private async maybeRequestBotMove(): Promise<void> {
    if (this.playMode !== 'bot') {
      return;
    }
    if (this.disposed || this.chessGame.isEnded()) {
      return;
    }
    if (this.chessGame.getCurrentTurn() !== 'black') {
      return;
    }
    if (this.gameState.botThinking) {
      return;
    }

    this.updateGameState({ botThinking: true });
    try {
      if (!this.stockfish) {
        this.stockfish = new StockfishEngine();
      }
      await this.stockfish.init(this.skillLevel);
      if (this.disposed) {
        return;
      }
      const uci = await this.stockfish.go(this.chessGame.fen());
      if (this.disposed) {
        return;
      }
      const result = this.chessGame.playUci(uci);
      await this.presentMove(result);
    } catch (error) {
      console.error(error);
    } finally {
      if (!this.disposed) {
        this.updateGameState({ botThinking: false });
      }
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

  private pickBoardPosition(): Position | null {
    const camera = this.scene.activeCamera;
    if (!camera) {
      return null;
    }
    const ray = this.scene.createPickingRay(
      this.scene.pointerX,
      this.scene.pointerY,
      BABYLON.Matrix.Identity(),
      camera
    );
    const plane = BABYLON.Plane.FromPositionAndNormal(
      new BABYLON.Vector3(0, 0.15, 0),
      BABYLON.Vector3.Up()
    );
    const distance = ray.intersectsPlane(plane);
    if (distance === null) {
      return null;
    }
    const hit = ray.origin.add(ray.direction.scale(distance));
    const file = Math.floor(hit.x + BOARD_OFFSET);
    const rank = Math.floor(hit.z + BOARD_OFFSET);
    if (file < 0 || file >= BOARD_SIZE || rank < 0 || rank >= BOARD_SIZE) {
      return null;
    }
    return { x: file, y: rank };
  }

  private setupEventHandlers(): void {
    this.scene.onPointerDown = () => {
      if (this.paused || this.interactionLocked || this.animating || this.chessGame.isEnded()) {
        return;
      }
      if (this.gameState.botThinking) {
        return;
      }
      if (this.playMode === 'bot' && this.chessGame.getCurrentTurn() !== 'white') {
        return;
      }
      const boardPos = this.pickBoardPosition();
      if (!boardPos) {
        this.cancelSelection();
        return;
      }
      const square = this.board.getSquare(boardPos);
      if (!square) {
        this.cancelSelection();
        return;
      }
      const occupant = square.getPiece();
      if (occupant) {
        const mesh = occupant.getMesh();
        const color = occupant.getColor();
        if (this.selectedPiece && color !== this.chessGame.getCurrentTurn()) {
          this.handleSquareSelection(square.getMesh());
          return;
        }
        this.handlePieceSelection(mesh);
      } else {
        this.handleSquareSelection(square.getMesh());
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

    this.applyOrbitInput(whiteCamera);
    this.applyOrbitInput(blackCamera);
    whiteCamera.fov = 0.8;
    blackCamera.fov = 0.8;
    this.whiteCameraDefaults = {
      alpha: whiteCamera.alpha,
      beta: whiteCamera.beta,
      radius: whiteCamera.radius,
    };
    this.blackCameraDefaults = {
      alpha: blackCamera.alpha,
      beta: blackCamera.beta,
      radius: blackCamera.radius,
    };

    whiteCamera.attachControl(this.canvas, true);
    scene.activeCamera = whiteCamera;

    if (!scene.metadata) {
      scene.metadata = {};
    }
    scene.metadata.whiteCamera = whiteCamera;
    scene.metadata.blackCamera = blackCamera;
    scene.metadata.currentCamera = 'white';
  }

  private applyOrbitInput(camera: BABYLON.ArcRotateCamera): void {
    camera.panningSensibility = 0;
    const pointers = camera.inputs.attached.pointers as unknown as
      | { buttons: number[] }
      | undefined;
    if (pointers) {
      pointers.buttons = [1, 2];
    }
  }

  private async flipCamera(): Promise<void> {
    if (!this.scene.metadata) {
      return;
    }

    const whiteCamera = this.scene.metadata.whiteCamera as BABYLON.ArcRotateCamera;
    const blackCamera = this.scene.metadata.blackCamera as BABYLON.ArcRotateCamera;
    const currentCamera = this.scene.metadata.currentCamera as 'white' | 'black';

    if (!whiteCamera || !blackCamera) {
      return;
    }

    const outgoing = currentCamera === 'white' ? whiteCamera : blackCamera;
    const incoming = currentCamera === 'white' ? blackCamera : whiteCamera;
    const incomingDefaults =
      currentCamera === 'white' ? this.blackCameraDefaults : this.whiteCameraDefaults;
    const incomingSide = currentCamera === 'white' ? 'black' : 'white';

    outgoing.detachControl();

    incoming.lowerAlphaLimit = Number.NEGATIVE_INFINITY;
    incoming.upperAlphaLimit = Number.POSITIVE_INFINITY;
    incoming.alpha = outgoing.alpha;
    incoming.beta = outgoing.beta;
    incoming.radius = outgoing.radius;
    this.scene.activeCamera = incoming;

    const targetAlpha = shortestAngleTo(incoming.alpha, incomingDefaults.alpha);
    await Promise.all([
      animateNumber(incoming, 'alpha', targetAlpha, CAMERA_ANIMATION_FRAMES, this.scene),
      animateNumber(incoming, 'beta', incomingDefaults.beta, CAMERA_ANIMATION_FRAMES, this.scene),
      animateNumber(
        incoming,
        'radius',
        incomingDefaults.radius,
        CAMERA_ANIMATION_FRAMES,
        this.scene
      ),
    ]);

    incoming.alpha = incomingDefaults.alpha;
    incoming.beta = incomingDefaults.beta;
    incoming.radius = incomingDefaults.radius;
    if (incomingSide === 'white') {
      incoming.lowerAlphaLimit = Math.PI;
      incoming.upperAlphaLimit = 2 * Math.PI;
    } else {
      incoming.lowerAlphaLimit = 0;
      incoming.upperAlphaLimit = Math.PI;
    }
    incoming.attachControl(this.canvas, true);
    this.scene.metadata.currentCamera = incomingSide;
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
  fen?: string,
  options?: GameOptions
): BABYLON.Scene => {
  const gameScene = new GameScene(engine, canvas, fen, options);
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
