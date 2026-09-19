# Roadmap

Status as of 2026-09: Phase 2 local vs-bot (Stockfish lite-single WASM) and leftover menu UI are in. Backend remains a stub. Next: Phase 3 backend alignment.

## Current product

| Surface | What exists |
|---------|-------------|
| Frontend | React 19 + Vite + Babylon.js 6. Procedural pieces, dual ArcRotate cameras, HUD, pause overlay, promotion and game-over overlays, How to Play, Settings |
| Rules | chessops adapter in `ChessGame.ts`. Castling, en passant, promotion, checkmate/stalemate |
| Modes | Hot-seat vs self (camera tween). Vs bot: human White, Stockfish UCI, camera stays on White |
| Auth UI | Login, register, guest. Local start works if the API is down |
| Networking | `GameSocket.ts` unused. Frontend `API_URL` is `http://localhost:8080` |
| Backend | Actix on default port 3000. In-memory DB. Auth + create/join game. Mongo, JWT middleware, WebSocket not wired |
| AI | Stockfish.js 19 lite-single in a Worker. Rust `tch` + `RLChessModel` stub. `cargo check` fails without libtorch |

Known remaining issues:

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

### Phase 2 - AI opponent

Done. Stockfish 19 lite-single WASM worker (`uci` / `isready` / `Skill Level` / `go movetime 500`). Menu: Play vs Self vs Play vs Bot (Easy 0 / Normal 5 / Hard 10 / Strong 20). Human is White. No camera flip in bot games. `playUci` on chessops. Thinking HUD. How to Play and Settings overlays. Explicit `camera.fov = 0.8`. Menu background is a CSS rust gradient (no missing PNG).

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
- Human as Black vs bot, chess clocks, mobile layout
