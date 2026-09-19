# Game modes

## Current

The main menu **Start Game** starts local hot-seat even if guest login against the Rust API fails.

| Mode | Status |
|------|--------|
| Local hot-seat (vs self) | Working. Camera flips after each legal ply. Rules via chessops |
| Vs bot | Not present (Phase 2) |
| Vs other user | Not present (Phase 4) |
| Settings / How to Play | Buttons with no handlers |
| Pause | Overlay on a still-mounted `GameView`. Picks ignored while paused. Resume keeps the position |
| Promotion | DOM overlay (queen, rook, bishop, knight) |
| Game over | Overlay with result. Main Menu unmounts the scene |

HUD: turn count, current color, elapsed wall-clock, material score, FPS, Pause.

Optional FEN: `http://localhost:5173/?fen=...` loads that position for the next Start Game (read when `GameView` mounts).

App screens: `menu | playing | paused`. `playing` and `paused` both keep `GameView` mounted.

## Target

Menu entries for vs bot (Phase 2) and vs player (Phase 4). Chess clocks. Same chessops position object.
