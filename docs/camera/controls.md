# Camera controls and picking

## Orbit / zoom (current)

`whiteCamera.attachControl(this.canvas, true)` at startup. `noPreventDefault` is `true` (second argument), so page scroll may still occur. The canvas fills the game view, which limits that.

Both cameras:

- Left button is reserved for picking (`pointers.buttons = [1, 2]`)
- Right or middle drag: orbit alpha/beta within limits
- Wheel / pinch: radius 8-20
- `panningSensibility = 0` so the target stays at the board origin

On turn change in **hot-seat only**, `flipCamera()`:

1. Detach control on the outgoing camera
2. Copy outgoing alpha/beta/radius onto the incoming camera (alpha limits relaxed)
3. Set `scene.activeCamera` to the incoming camera
4. Tween alpha/beta/radius to that side's default pose (~250 ms)
5. Restore alpha limits, `attachControl(canvas, true)`
6. `metadata.currentCamera` = `'white' | 'black'`

**Play vs Bot** never calls `flipCamera()`. The active camera stays WhiteCamera.

## Picking (current)

`scene.onPointerDown` is the only selection path. Clicks are mapped by a ray against the board plane (y = 0.15) to a file/rank, so tall pieces do not steal neighboring squares. Piece `OnPickTrigger` was removed. Hover scale remains.

- Miss / ground / extended grid -> `cancelSelection()`
- Friendly piece of the side to move -> legal dests from chessops
- Highlighted dest square, or opponent piece on a dest -> `play`
- Paused, promotion pending, animating, game over, or bot thinking -> ignore picks
- Vs bot: ignore picks unless it is White's turn

Square hover contours use `ActionManager` on each box.

## Target

1. **Hot-seat** - keep the tweened flip after a completed ply.
2. **Vs bot / vs player** - do not flip. Do not attach control in a way that lets the player orbit under the board (existing beta cap is enough). Disable picking of opponent pieces.
3. **While engine thinking or animating** - ignore pointer down (both are gated).
4. **Touch** - ArcRotate pinch zoom should work. Square pick needs a slightly larger pick radius on mobile.
5. Larger pick radius on mobile.

Pointer to chessops: pick world mesh -> `Position {x,y}` -> algebraic square -> `legalDests`. Do not call `Move.isValid`.
