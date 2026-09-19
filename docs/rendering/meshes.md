# Meshes

## Procedural pieces (current, default)

`frontend/src/game/meshes/` exports `createCustomMesh(type, scene, color, position?)`.

Each type builds primitive parts (`CreateCylinder`, `CreateSphere`, `CreateBox`) then `Mesh.MergeMeshes`. `createCustomMesh` then:

- Scales by `PIECE_SCALES`: pawn 1.2, rook 0.6, bishop 0.6, knight 1.5, queen 1.5, king 1.5
- `COLOR_SCALES` white/black both `1.0`
- Sets `position.y` to half bounding height so the base sits at y = 0
- Names `{type}_{x}_{y}` when position is passed
- Writes mesh metadata (`pieceType`, `isWhite`, `position`, `originalScale`)

`Piece` applies `COLORS.WHITE` / `COLORS.BLACK` as `StandardMaterial`.

If merge fails, `Piece` falls back to simple cylinders (queen crown, king cross).

Files: `pawn.ts`, `rook.ts`, `knight.ts`, `bishop.ts`, `queen.ts`, `king.ts`, `index.ts`.

There is no shared "wood" texture. Silhouette is stylized low-poly, not a Staunton scan.

## Board meshes

- Squares: boxes, checker materials
- Labels: thin boxes + `DynamicTexture` text
- Ground + extended grid: extra boxes around the 8x8

## Unused GLTF

`frontend/public/assets/chess_pieces/scene.gltf` plus `license.txt`. No `SceneLoader` / `@babylonjs/loaders` usage. Keep the files. Do not switch the default look until:

1. License is compatible with the repo MIT license (read `license.txt` at art-pass time)
2. Per-piece nodes can be instanced and colored
3. Scale matches `SQUARE_SIZE = 1`

Phase 0-2 stay procedural.

## Target

- Keep merge-based pieces as the supported path
- After a move, rename mesh or stop encoding position in the name. Metadata + `Piece.position` are enough
- Optional: share materials (two piece materials, two square materials) instead of one material per square
- Do not add morph targets until animations exist ([animations.md](animations.md))
