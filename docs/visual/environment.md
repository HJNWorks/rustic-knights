# Environment and lighting

Source: `GameScene.createScene()` and `Board.createVisualBoard()`.

## Current

### Sky / clear color

`scene.clearColor = Color4(0.2, 0.2, 0.3, 1)` - blue-gray. No skybox, no IBL, no fog.

### Light

One `HemisphericLight` named `light`:

- Direction / position vector: `(0, 10, 0)`
- Intensity: `0.7`
- Default Babylon hemispheric ground color (not overridden)

No directional sun, no shadows (`ShadowGenerator` unused), no point lights on pieces.

### Ground and surround

- Playable ground plane: `CreateGround('ground', { width: 12, height: 12 })` because `BOARD_SIZE + 4` with `BOARD_SIZE = 8`. Diffuse `(0.3, 0.3, 0.3)`. `position.y = -0.1`
- 8x8 boxes height `0.3`, centered at `y = 0.15`
- File/rank label tiles height `0.1`, rust brown, white Arial via `DynamicTexture`
- Extended decorative checker around the board (`createExtendedGrid`) using `EXTENDED_LIGHT` / `EXTENDED_DARK`

A copy-paste bug assigns a material intended for the extended ground onto `ground` in `createExtendedGrid`. Confirm before changing lighting.

### UI chrome around the scene

Menus sit in CSS, not in the 3D scene. Dark panel `rgba(30, 30, 40, 0.9)`, rust border. `theme.css` sets `body` background image `../../assets/menu_background.png` (file missing in the repo). `overflow: hidden` on `body`.

No post-process (bloom, SSAO, FXAA) is configured.

## Target

Keep the dim blue-gray void and single hemispheric light as the default "rustic indoor table" look until a dedicated art pass.

Candidates (Phase 1+, optional):

- Explicit `light.groundColor` slightly warmer so black pieces read on dark squares
- Shadow generator from a low directional light if performance allows
- Restore or replace menu background asset
- Do not add a busy HDRI that fights the rust/orange HUD

Environment color tokens live in [palette.md](palette.md). Lighting numeric values stay here.
