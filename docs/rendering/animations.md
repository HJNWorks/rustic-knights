# Animations

## Current

Piece movement is an instant teleport in `Board.movePiece` (mesh `position.x` / `position.z` assigned). No `Animation`, `AnimationGroup`, or tween helper.

Capture: the captured mesh is disposed or hidden immediately (no fade).

Camera: `flipCamera` detaches controls and swaps `activeCamera`. No interpolation of alpha/beta/radius.

CSS only: Radix modal `overlayShow` / `contentShow` keyframes. Button hover `translateY(-2px)`.

`Piece` hover scales mesh to 1.1. Pick trigger scales to 1.2. These are discrete assignments, not Babylon animations.

## Target (Phase 1)

Drive motion from a legal move result (UCI + flags from chessops), not from picking.

1. **Move lerp** - 150-250 ms translation of the moving mesh along x/z. Keep y constant. Ease-out.
2. **Capture** - captured piece scales to 0 or fades alpha over the same window, then dispose.
3. **Castling** - king lerp plus rook lerp (two meshes, same duration).
4. **En passant** - move pawn, fade the captured pawn on the adjacent square (not the destination).
5. **Promotion** - arrive on last rank, then swap mesh type (instant swap is acceptable for v1).
6. **Camera** - optional. Animate alpha/beta/radius toward the other side's default instead of swapping camera objects. If two cameras stay, cross-fade is not required.

Input: ignore picks while an animation is running (`animating` flag on `GameScene`).

Do not animate illegal or rolled-back moves. The adapter commits first, then the view plays. If a later server reject happens (Phase 4), snap back without a reverse animation.

Stockfish moves use the same animation path as human moves.

Out of scope: piece idle bob, cloth, particles on capture.
