# Architecture decisions

Locked for this restart. Change only with an explicit docs update.

## D1. Client library is the rules source of truth

**Choice:** chessops (TypeScript), not the custom `Move.ts` geometry engine, and not chess.js unless chessops proves impractical.

**Why:** The custom engine is incomplete (castling, en passant, promotion, checkmate, moving into check). A library that speaks FEN and UCI matches Stockfish and later `shakmaty`. chess.js is smaller. chessops is closer to Lichess-style position handling.

**Consequence:** `ChessGame` becomes an adapter: hold a `Chess` / `Position` object, expose legal destinations for highlights, apply moves, report game over. `Piece.getValidMoves` must not brute-force `Move.isValid()`. Babylon classes stay rendering and input.

**Not chosen:** Completing the custom TypeScript engine. Dual engines long term.

## D2. Stockfish first for the AI opponent

**Choice:** Stockfish WASM in a Web Worker. UCI protocol. Strength via Skill Level or UCI Elo.

**Why:** The old TODO ("play vs bot (RL)") would delay a playable opponent. The Rust `tch` tree does not compile without libtorch and has no move selection.

**Consequence:** Phase 2 adds a worker, a menu entry, and a loop: chessops FEN -> engine `go` -> UCI move -> adapter -> mesh update. Custom RL is research after multiplayer, in a separate Python training pipeline if at all. It does not live in the Actix process.

**Not chosen:** Minimax in TypeScript as the first bot. RL as the first bot.

## D3. Keep Rust for accounts and later multiplayer. Slim the crate now

**Choice:** Keep Actix, `User`, `GameSession`, Mongo/`DbConnection`, auth and lobby handlers. Remove `tch` and the unfinished `backend/src/ai` tree from the default build so `cargo check` works. Later add `shakmaty` for server-side validation.

**Why:** The 3D work is in TypeScript. The backend is a small lobby sketch, not a failed rewrite candidate. Rust is still useful for concurrent WebSocket rooms. In-process PyTorch on that crate is not.

**Consequence:**

- Do not rewrite the API in Node
- Do not train models inside `backend/`
- Phase 3: align port with the frontend, hash passwords on the in-memory path, reject bad JWTs, optional real Mongo
- Phase 4: `/ws/game/{id}`, shared JSON, FEN on `GameSession`

**Not chosen:** Python as the game server. Keeping `tch` as a Cargo dependency.

## D4. Babylon remains the view

Procedural meshes, contour highlights, dual cameras, and the rust palette stay the baseline. Optional GLTF (`frontend/public/assets/chess_pieces/scene.gltf`) is an art upgrade, not a requirement for a working game.

## D5. Local play does not wait on the backend

Phases 0-2 ship with the engine and rules in the browser. Auth UI may remain, but a guest or unauthenticated local game must work if the Rust process is down.
