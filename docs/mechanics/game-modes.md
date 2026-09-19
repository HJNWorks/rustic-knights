# Game modes

## Current

The main menu **Start Game** starts local hot-seat even if guest login against the Rust API fails. Meshes come from `chessGame.placedPieces()`, not a second layout table.

| Mode | Status |
|------|--------|
| Local hot-seat (vs self) | Working. Camera tweens after each legal ply. Rules via chessops |
| Vs bot | Not present (Phase 2) |
| Vs other user | Not present (Phase 4) |
| Settings / How to Play | Buttons with no handlers |
| Pause | Overlay on a still-mounted `GameView`. Picks ignored while paused. Resume keeps the position |
| Promotion | DOM overlay (queen, rook, bishop, knight) |
| Game over | Overlay with result. Main Menu unmounts the scene |

HUD: turn count, current color, elapsed wall-clock, material score, FPS, Pause.

Optional FEN: `http://localhost:5173/?fen=...` is consumed once when `GameView` mounts, then stripped from the URL. Main Menu also strips `fen`. The next Start Game is a full 32-piece start unless a new `?fen=` is opened.

App screens: `menu | playing | paused`. `playing` and `paused` both keep `GameView` mounted.

## Target

Menu entries for vs bot (Phase 2) and vs player (Phase 4). Chess clocks. Same chessops position object.
