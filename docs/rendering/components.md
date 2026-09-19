# Component types and rendering

Domain objects wrap Babylon meshes. They are not React components.

## Square

File: `frontend/src/game/elements/Square.ts`.

- Mesh: `CreateBox` width/depth `SQUARE_SIZE` (1), height `0.3`, name `square_{x}_{z}`
- Metadata: `{ type: 'square', square: this }`
- Occupancy: `piece: Piece | null`
- Highlight: `SquareHighlightState` enum in `types/chess.ts`

States: `DEFAULT`, `HOVER`, `SELECTED`, `VALID_MOVE`, `LAST_MOVE`, `CHECK`, `ENDANGERED`, `CONTOUR`.

Implementation: 12 `CreateLines` edges of the cube (`renderingGroupId = 1`). Color from [palette.md](../visual/palette.md). `DEFAULT` has no lines. Hover is registered on the box via `ActionManager` OnPointerOver/Out, only if the square is still `DEFAULT`.

`canBeOccupiedBy` allows empty squares or opponent pieces.

## Piece

File: `frontend/src/game/elements/Piece.ts`.

- Logical `Position`, `ChessPieceType`, color
- Mesh from `createCustomMesh` with fallback primitives
- Metadata: `{ type: 'piece', piece, pieceType, isWhite, position }`
- `getValidMoves(board)` currently uses custom `Move` (to be replaced)

Also has its own `ActionManager` OnPickTrigger that scales to 1.2 and sets a module-level `selectedPiece`. That path races `GameScene` picking. Target: picking only in `GameScene`. Hover scale 1.1 may stay on the piece.

World position: x/z from board index minus `BOARD_OFFSET` plus half square. y from bounding box so the mesh sits on the square.

## Board

File: `frontend/src/game/elements/Board.ts`.

Owns:

- `Map` of squares keyed `"x,z"`
- Piece creation (standard setup)
- `movePiece(from, to)` - updates occupancy and **teleports** mesh x/z
- Highlight helpers: valid moves, king in check, endangered
- Snapshot `saveGameState` / `restoreGameState` (used for check trial moves). Type is an inline TODO, not exported

`BOARD_SIZE = 8`, `SQUARE_SIZE = 1`, `BOARD_OFFSET = 4`.

Picking helpers: `isPiece(mesh)` (name regex), `getSquarePositionFromPieceMesh`, `getPieceColorFromMesh` / `getPieceColor`. Color-from-name is unsafe after moves. Prefer `mesh.metadata.piece.getColor()`.

## GameScene

Orchestrates engine scene, cameras, pointer handlers, `ChessGame`, HUD callbacks. Stores itself on `scene.metadata.gameSceneInstance`.

React `GameView` only creates the engine, render loop, resize, timer, and overlay DOM.

## HUD React components

- `MainMenu` - title, auth, Start Game
- `GameView` - canvas + info bar
- `PauseMenu` - Resume, Main Menu
- Auth dialogs (Radix)

Target: pass a live `ChessGame` adapter into `App` for pause, or overlay pause without unmounting `GameView` ([game-modes.md](../mechanics/game-modes.md)).

## Highlight policy (target)

After chessops:

- Selected origin: `SELECTED`
- Legal quiet moves: `VALID_MOVE`
- Legal captures: `ENDANGERED` or a dedicated capture color (keep red)
- King in check: `CHECK`
- Last ply from and to: `LAST_MOVE`
- Clear all of the above on the next selection, except last-move which persists until the next ply
