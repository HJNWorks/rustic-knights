# Architecture overview

## Layers

```
index.tsx
  App.tsx  (menu | playing | paused)
    MainMenu + AuthContext
    GameView  -> BABYLON.Engine + createGameScene()
      GameScene
        Board / Square / Piece / meshes
        ChessGame / Move          (current rules, to be replaced)
    PauseMenu
```

React owns shell, auth UI, and HUD. Babylon owns the 3D scene, picking, cameras, and (today) calling into custom chess rules.

The Rust crate is a separate HTTP process. The running game does not depend on it.

## Data flow (current)

1. `GameView` creates an engine and `createGameScene(engine, canvas, onState)`.
2. `GameScene` constructs `Board` then `ChessGame(board)`.
3. Pointer down picks a mesh. Piece vs square is decided by `board.isPiece()`.
4. Valid-move highlights come from `Piece.getValidMoves()` which brute-forces `Move.isValid()` over 64 squares.
5. `chessGame.makeMove(from, to)` mutates the board, flips turn, highlights check/endangered.
6. `GameScene` updates React HUD via `onGameStateUpdate` (turn, scores). Timer is a React interval, not a chess clock.
7. On turn change, `flipCamera()` swaps `WhiteCamera` / `BlackCamera`.

`scene.metadata` holds `board`, `whiteCamera`, `blackCamera`, `currentCamera`, `gameSceneInstance`.

## File map

| Area | Path |
|------|------|
| App shell | `frontend/src/App.tsx` |
| HUD / canvas | `frontend/src/components/GameView.tsx` |
| Scene | `frontend/src/game/elements/GameScene.ts` |
| Board / pieces / squares | `frontend/src/game/elements/{Board,Piece,Square}.ts` |
| Rules | `frontend/src/game/rules/{ChessGame,Move}.ts` |
| Types | `frontend/src/types/chess.ts`, `types.ts`, `user.ts` |
| Meshes | `frontend/src/game/meshes/` |
| Unused P2P | `frontend/src/game/p2p/{GameSocket,Player}.ts` |
| Auth | `frontend/src/util/authService.ts`, `AuthContext.tsx` |
| API base | `frontend/src/config.ts` (`http://localhost:8080`) |
| Backend | `backend/src/main.rs` |

Two different `GameState` types exist: HUD state in `GameScene.ts`, network state in `types.ts`. Do not merge them without renaming.

## Backend (current)

Actix `HttpServer` on `HOST`/`PORT` (default `127.0.0.1:3000`). CORS allows any origin.

Registered routes:

- `POST /auth/login`, `POST /auth/register`, `GET /auth/guest`
- `POST /game/create`, `POST /game/{game_id}/join`

Always `create_in_memory_db()`. `connect()` to Mongo exists and is unused. JWT middleware and WebSocket handler exist and are not registered. `mod ai` is not mounted from `main.rs`.

`GameSession` stores player ids, `moves: Vec<String>`, and `Waiting | InProgress | Completed`. No FEN.

## Target data flow

```
React HUD
    ^
    |  game status, clocks, result
GameScene  <-->  ChessGame adapter  <-->  chessops position
    |                                      ^
    |  apply UCI / animate mesh            |  FEN
    v                                      |
Board / Piece                              Stockfish worker (Phase 2)
                                           |
Phase 4: GameSocket <--> Actix WS <--> shakmaty + GameSession
```

Local play (Phases 0-2) does not require the Rust process. Multiplayer (Phase 4) makes the server authoritative. The client still uses chessops for legal-move previews.

## Auth vs play

Starting a game from the menu calls `guestLogin()` if unauthenticated, then mounts `GameView`. The token is unused by the scene. Matchmaking is not connected.
