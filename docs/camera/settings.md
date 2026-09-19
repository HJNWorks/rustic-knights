# Camera settings (3D FOV)

Source: `GameScene.setupCamera()`. Two `ArcRotateCamera` instances, target `Vector3.Zero()`.

Babylon `ArcRotateCamera` uses perspective projection. **`fov` is never assigned.** Default in Babylon.js 6 is `0.8` radians (the `Camera.FOVMODE_VERTICAL_FIXED` default). Treat 0.8 as the current FOV until a measured value is logged from a running scene.

## Shared limits (both cameras)

| Property | Value |
|----------|--------|
| Constructor alpha | `Math.PI / 2` |
| Constructor beta | `Math.PI / 3` |
| Constructor radius | `12` |
| `lowerRadiusLimit` | `8` |
| `upperRadiusLimit` | `20` |
| `lowerBetaLimit` | `0.1` |
| `upperBetaLimit` | `Math.PI / 2.2` (~1.428, just below top-down) |

Beta stays below `PI/2` so the camera cannot go under the board.

## WhiteCamera

- Name: `WhiteCamera`
- `setPosition(0, 8, -12)` after construction (overrides the spherical constructor pose)
- `lowerAlphaLimit = Math.PI`
- `upperAlphaLimit = 2 * Math.PI`
- Attached to the canvas at start. `scene.activeCamera`

Alpha range keeps the view on white's side of the table (negative Z).

## BlackCamera

- Name: `BlackCamera`
- `setPosition(0, 8, 12)`
- `lowerAlphaLimit = 0`
- `upperAlphaLimit = Math.PI`

Positive Z, black's side.

## Metadata

```
scene.metadata.whiteCamera
scene.metadata.blackCamera
scene.metadata.currentCamera  // 'white' | 'black'
```

## Target

- Document and optionally set `camera.fov = 0.8` explicitly on both cameras so upgrades of Babylon do not silently change framing
- Keep radius 8-20 and beta cap. These define the "tabletop" feel
- If Phase 1 tweens a single camera instead of swapping, preserve the two rest poses `(0, 8, -12)` and `(0, 8, 12)` as endpoints
- Vs-bot / vs-human: lock to the local player's camera. Do not flip unless the user enables hot-seat
- Wheel zoom is ArcRotate default (radius). Do not add FPS camera or orthographic mode in v1

## Not used

- `UniversalCamera` / WASD
- VR / WebXR
- Camera inertia overrides (Babylon defaults apply)
- `fovMode` override
