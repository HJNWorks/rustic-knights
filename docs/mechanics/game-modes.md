# Game modes

## Current

The main menu starts a local game even if guest login against the Rust API fails. Meshes come from `chessGame.placedPieces()`, not a second layout table.

| Mode | Status |
|------|--------|
| Local hot-seat (Play vs Self) | Working. Camera tweens after each legal ply. Rules via chessops |
| Vs bot (Play vs Bot) | Working. Human is White. Camera stays on WhiteCamera. Stockfish lite-single worker. Skill Level 0 / 5 / 10 / 20 (Easy / Normal / Hard / Strong). `go movetime 500`. Bot promotions come from UCI. HUD shows "Bot thinking" while the worker is out. Picks ignored while thinking |
| Vs other user | Not present (Phase 4) |
| Settings | Radix overlay. Session-only copy of controls. No backend. Strength is not stored here |
| How to Play | Radix overlay. Pick, orbit, zoom, pause, promotion, vs-bot camera |
| Pause | Overlay on a still-mounted `GameView`. Picks ignored while paused. A bot `bestmove` that arrives while paused is still applied under the overlay. Resume keeps the position |
| Promotion | DOM overlay (queen, rook, bishop, knight) for the human. Bot uses the UCI suffix |
| Game over | Overlay with result. Main Menu unmounts the scene and terminates the worker |

HUD: turn count, current color, elapsed wall-clock, material score, FPS, Pause, optional "Bot thinking".

Optional FEN: `http://localhost:5173/?fen=...` is consumed once when `GameView` mounts, then stripped from the URL. Main Menu also strips `fen`. The next start is a full 32-piece start unless a new `?fen=` is opened.

App screens: `menu | playing | paused`. `playing` and `paused` both keep `GameView` mounted. Start options `{ mode, skillLevel }` are passed into `createGameScene`.

## Target

Menu entry for vs player (Phase 4). Chess clocks. Human as Black. Same chessops position object.
