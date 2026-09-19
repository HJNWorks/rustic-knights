# Roadmap

Status as of 2026-09: Phase 1 local hot-seat is FIDE-legal, 32-piece Start Game, left-click pick, move and camera tweens. Backend and AI remain stubs. Next: Stockfish (Phase 2).

## Current product

| Surface | What exists |
|---------|-------------|
| Frontend | React 19 + Vite + Babylon.js 6. Procedural pieces, dual ArcRotate cameras, HUD, pause overlay, promotion and game-over overlays |
| Rules | chessops adapter in `ChessGame.ts`. Castling, en passant, promotion, checkmate/stalemate |
| Modes | Hot-seat vs self. Camera tweens on turn. `?fen=` consumed once |
| Auth UI | Login, register, guest. Start Game works if the API is down. Settings / How to Play have no handlers |
| Networking | `GameSocket.ts` unused. Frontend `API_URL` is `http://localhost:8080` |
| Backend | Actix on default port 3000. In-memory DB. Auth + create/join game. Mongo, JWT middleware, WebSocket not wired |
| AI | Rust `tch` + `RLChessModel` stub. `cargo check` fails without libtorch |

Known remaining issues:

- `theme.css` references missing `assets/menu_background.png`
- No dedicated mobile layout

## Keep, replace, add

| Area | Action |
|------|--------|
| React menus, HUD, GameView canvas | Keep |
| `Board`, `Square`, `Piece`, procedural meshes | Keep, then polish |
| Dual cameras, rust palette, contour highlights | Keep as the visual baseline |
| `User`, `GameSession`, auth/lobby handlers, `DbConnection` | Keep |
| Custom legality in `Move.ts` / `ChessGame.ts` | Replace with chessops. Keep `ChessGame` as a thin adapter |
| Dual picking, pause wiring, mesh-name color | Done in Phase 0. Left-click pick vs orbit in Phase 1 |
| `backend/src/ai` and Cargo `tch` | Remove from the default build |
| `scene.gltf` | Keep on disk. Do not load until an art pass |
| `GameSocket.ts` | Rewrite in Phase 4 to match a shared protocol |

Do not rewrite the Babylon scene. Do not rewrite the backend in Node.

## Phases

### Phase 0 - Playable local chess (frontend only)

Done. chessops adapter, promotion and game-over overlays, single pointer path, metadata piece color, pause without unmounting the canvas.

### Phase 1 - Presentation

Done. Meshes spawn from chessops `placedPieces()`. `?fen=` is consumed once. Left click picks. Right/middle orbit. Move lerp, capture scale-out, castle/ep, promotion swap, camera tween. Picks ignored while `animating`.

Not in this phase: explicit `camera.fov`, FEN snapshot restore (canvas stays mounted on pause), mobile layout.

### Phase 2 - AI opponent

- Stockfish WASM in a worker
- Main menu: vs self / vs bot + strength (UCI Skill Level or Elo)
- Engine speaks UCI. chessops position is the board

### Phase 3 - Backend aligned with the client

- Same port as `frontend/src/config.ts` (8080) or change the client
- Mongo with in-memory fallback. bcrypt on both register paths
- JWT middleware rejects invalid tokens
- CI: `cargo check` without libtorch

### Phase 4 - Multiplayer

- Register `/ws/game/{id}`
- Shared message schema (FEN, UCI, game id, result)
- Server validates with `shakmaty`. Client is a view plus optimistic preview

## Out of scope until later

- Training a custom RL model
- In-process PyTorch (`tch`) on the game server
- Dual rule engines (custom TypeScript plus chessops)
- Loading the unused GLTF as the default look
