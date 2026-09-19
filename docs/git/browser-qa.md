# Browser UI QA

Local play is verified in a real browser against Vite at [http://localhost:5173/](http://localhost:5173/). The Rust process is not required for hot-seat.

Use **cursor-ide-browser** (`browser_navigate`, `browser_lock`, `browser_snapshot`, `browser_click`, `browser_take_screenshot`, `browser_mouse_click_xy`). Playwright MCP is the fallback.

## DOM vs canvas

| Surface | How to drive it |
|---------|-----------------|
| Main menu, HUD, pause, promotion, game over | Snapshot, click refs |
| Board / pieces | Screenshot. Pieces are not in the accessibility tree. Click square centers with `browser_mouse_click_xy` |

Lock the tab for the pass. Unlock when finished.

## Phase 0 checklist

1. Start Game (guest login if the modal appears). HUD shows White's turn.
2. Legal quiet move (e2-e4). HUD shows Black's turn.
3. Illegal click with a piece selected. Position and turn unchanged.
4. Pause overlay on the still-mounted canvas. Resume. Same position.
5. Castling: king and rook both move.
6. Promotion chooser (or queen default). Mesh type changes.
7. Checkmate overlay. Further board clicks ignored. Main menu returns.

Coordinate mapping for the canvas lives in `frontend/src/game/rules/squares.ts`. If clicks miss squares, fix mapping and re-run this list.
