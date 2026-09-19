# Camera controls and picking

## Orbit / zoom (current)

`whiteCamera.attachControl(this.canvas, true)` at startup. `noPreventDefault` is `true` (second argument), so page scroll may still occur. The canvas fills the game view, which limits that.

ArcRotate defaults (not overridden):

- Left drag: rotate alpha/beta within limits
- Wheel / pinch: radius 8-20
- Right or middle drag: pan (Babylon default). Panning can slide the target off the board origin

On turn change, `flipCamera()`:

1. `activeCamera.detachControl()`
2. Set `scene.activeCamera` to the other camera
3. `attachControl(canvas, true)`
4. `metadata.currentCamera` = `'white' | 'black'`

Swap is immediate. Each camera keeps its last alpha/beta/radius independently.

## Picking (current)

`scene.onPointerDown` is the only selection path. Piece `OnPickTrigger` was removed. Hover scale remains.

- Miss / ground / extended grid -> `cancelSelection()`
- Friendly piece of the side to move -> legal dests from chessops
- Highlighted dest square, or opponent piece on a dest -> `play`
- Paused, promotion pending, or game over -> ignore picks

Square hover contours use `ActionManager` on each box.

## Target

1. **Hot-seat** - keep flip after a completed ply. Tween later ([animations.md](../rendering/animations.md)).
3. **Vs bot / vs player** - do not flip. Do not attach control in a way that lets the player orbit under the board (existing beta cap is enough). Disable picking of opponent pieces.
4. **While engine thinking or animating** - ignore pointer down.
5. **Pan** - consider `camera.panningSensibility = 0` or a high value so the board stays centered, unless playtesting wants pan.
6. **Touch** - ArcRotate pinch zoom should work. Square pick needs a slightly larger pick radius on mobile (Phase 1).
7. Larger pick radius on mobile (Phase 1).

Pointer to chessops: pick world mesh -> `Position {x,y}` -> algebraic square -> `legalMovesFrom`. Do not call `Move.isValid`.
