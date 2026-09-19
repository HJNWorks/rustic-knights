# Color palettes and style

Two palettes: Babylon scene (`frontend/src/util/constants.ts`) and CSS chrome (`theme.css`, `App.css`).

## Brand

Name: Rustic Knights. Accent is rust/orange, not gold.

| Token | Hex / RGB | Use |
|-------|-----------|-----|
| CSS `--primary-color` | `#cc5500` | Titles, borders, primary buttons |
| CSS `--secondary-color` | `#ff7f50` | Button hover (theme.css) |
| Primary hover (App.css) | `#e67e22` | `.primary-btn:hover` |
| Menu panel | `rgba(30, 30, 40, 0.9)` | Main/pause menus |
| CSS `--background-color` | `#f5f5f5` | Body (often covered by missing menu image) |
| CSS `--text-color` | `#333333` | Body text. Menus mostly use white on dark panels |
| Title type | `Luminari`, fantasy fallback | `h1` in theme.css |

Do not introduce a second accent (cyan, purple UI chrome) without updating this file. In-scene check highlight is already purple. That is a board signal, not brand.

## Scene (`COLORS`)

Babylon `Color3` 0-1:

| Name | RGB | Use |
|------|-----|-----|
| `WHITE` | `(0.9, 0.9, 0.9)` | White pieces |
| `BLACK` | `(0.2, 0.2, 0.2)` | Black pieces |
| `RUST` | `(183, 65, 14) / 255` | Rim label tiles (duplicated inline in `Board.createBoardLabels`) |
| `LIGHT_SQUARE` | `(0.8, 0.8, 0.7)` | Warm off-white squares |
| `DARK_SQUARE` | `(0, 0, 0)` | Black squares |
| `EXTENDED_LIGHT` | `(0.35, 0.35, 0.35)` | Decorative grid |
| `EXTENDED_DARK` | `(0.25, 0.25, 0.25)` | Decorative grid |
| `VALID_MOVE_HIGHLIGHT` | `(0.2, 0.8, 0.2)` | Legal destination contours |
| `SELECTED_HIGHLIGHT` / `FRIENDLY_HIGHLIGHT` | `(0.9, 0.9, 0.2)` | Selection. Hover uses this scaled by 0.7 |
| `CHECK_HIGHLIGHT` | `(0.6, 0.1, 0.8)` | King in check |
| `ENDANGERED_HIGHLIGHT` | `(0.9, 0.1, 0.1)` | Attacked friendly piece |
| `CONTOUR_HIGHLIGHT` | `(1, 0, 0)` | Named, little used vs endangered red |
| Last-move (inline) | `(0.1, 0.6, 0.9)` | `SquareHighlightState.LAST_MOVE` - not in `COLORS` |
| Sky | `(0.2, 0.2, 0.3)` | `clearColor` |
| Ground | `(0.3, 0.3, 0.3)` | Main ground plane |
| Piece hover (inline in `Piece`) | teal / red materials | Parallel to contour system |

Materials are `StandardMaterial.diffuseColor`. No PBR metals/roughness.

## Style rules for later work

- Highlights are **contour lines** on the cube, not a full-square emissive tint (see [components.md](../rendering/components.md))
- Dark squares are true black. If pieces disappear, raise `BLACK` piece or `DARK_SQUARE` slightly rather than adding outline shaders first
- HUD should keep rust on dark panels. Avoid light-mode game overlay
- When adding last-move, promotion, or bot-thinking states, extend `COLORS` instead of new inline `Color3`s

## Target

Freeze this palette for Phase 0-2. Optional later: slightly lift `DARK_SQUARE` to `(0.08, 0.07, 0.06)` so contour lines read on black. Optional: move last-move blue into `COLORS.LAST_MOVE`.
