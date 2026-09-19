# Animations

## Current (Phase 1)

`ChessGame.play` commits first. `Board.applyLegalMove` then plays Babylon tweens from `frontend/src/game/rendering/tween.ts` (~200 ms, cubic ease-out, 12 frames at 60 fps). `GameScene.animating` ignores picks until the move and camera tween finish.

1. Quiet move: lerp mesh x/z, hold y.
2. Capture: scale the captured mesh to 0 over the same window, then dispose. Shared materials are not faded.
3. Castling: king lerp and rook lerp in parallel.
4. En passant: mover lerp plus scale-out of the pawn on `flags.enPassantCapture`.
5. Promotion: arrive on the last rank, then swap the mesh type.
6. Camera: copy the outgoing pose onto the incoming `ArcRotateCamera`, tween alpha/beta/radius to that side's default (~250 ms), restore alpha limits, then `attachControl`.

`Board.movePiece` still teleports. Live play uses `applyLegalMove`.

CSS: Radix modal `overlayShow` / `contentShow`. Button hover `translateY(-2px)`. Piece hover scale 1.1 remains discrete.

## Later

Stockfish (Phase 2) uses the same `commitMove` / `applyLegalMove` path. Phase 4 server rejects snap back without a reverse animation.

Out of scope: piece idle bob, cloth, particles on capture.
