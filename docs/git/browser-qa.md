# Browser UI QA

Local play is verified in a real browser against Vite at [http://localhost:5173/](http://localhost:5173/). The Rust process is not required for hot-seat.

Use **cursor-ide-browser** (`browser_navigate`, `browser_lock`, `browser_snapshot`, `browser_click`, `browser_take_screenshot`, `browser_mouse_click_xy`). Playwright MCP is the fallback.

## DOM vs canvas

| Surface | How to drive it |
|---------|-----------------|
| Main menu, HUD, pause, promotion, game over | Snapshot, click refs |
| Board / pieces | Screenshot. Pieces are not in the accessibility tree. Click square centers with `browser_mouse_click_xy` |

Lock the tab for the pass. Unlock when finished.

## Phase 1 checklist

1. Start Game with no `fen` query. 32 pieces. HUD shows White's turn. URL has no `fen`.
2. Open `?fen=` (sparse or mate), Main Menu, Start Game. Full board again. Picking works.
3. Left-click e2 then e4. Piece lerps. HUD shows Black's turn. Camera tweens. Left click does not orbit.
4. Illegal click with a piece selected. Position and turn unchanged.
5. Pause overlay on the still-mounted canvas. Resume. Same position.
6. `?fen=` promotion once. Chooser (or queen default). Mesh type changes. URL stripped.
7. Checkmate overlay. Further board clicks ignored. Main menu returns.

Coordinate mapping for the canvas lives in `frontend/src/game/rules/squares.ts`. If clicks miss squares, fix mapping and re-run this list.
