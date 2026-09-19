# Licensing

## Source code: MIT

The repository license is MIT. The full text is in [`LICENSE`](../../LICENSE) at the repo root.

Copyright (c) 2025-2026 heoj1N.

`package.json` (root) and `frontend/package.json` set `"license": "MIT"`.

Keep the copyright notice and permission text in all copies or substantial portions of the software, as the MIT text requires.

## Third-party asset: CC-BY-4.0

`frontend/public/assets/chess_pieces/` includes a Sketchfab model that is **not** MIT:

- Title: Chess pieces
- Author: nikolokko
- Source: [https://sketchfab.com/3d-models/chess-pieces-6c30b70322ff4ebfb5874cf51a4e2bba](https://sketchfab.com/3d-models/chess-pieces-6c30b70322ff4ebfb5874cf51a4e2bba)
- License: [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/)
- Local copy of terms: `frontend/public/assets/chess_pieces/license.txt`

Attribution required by that license:

This work is based on "Chess pieces" (https://sketchfab.com/3d-models/chess-pieces-6c30b70322ff4ebfb5874cf51a4e2bba) by nikolokko (https://sketchfab.com/nikolokko) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/).

Do not relicense the GLTF as MIT. The procedural piece meshes in `frontend/src/game/meshes/` are original to this project and follow the repo MIT license. The GLTF is unused by the running game as of the current docs.

## Third-party library: chessops (GPL-3.0-or-later)

`frontend` depends on `chessops` for rules. That crate is GPL-3.0-or-later. Distributing a combined frontend build may require offering corresponding source under GPL terms. The rest of this repository stays MIT. Revisit if a BSD/MIT rules library is required for shipping.

## Third-party library: Stockfish.js (GPL-3.0)

`frontend` depends on `stockfish` (Stockfish.js 19, Chess.com / nmrugg). The engine is GPL-3.0. The running client uses only the **lite single-thread** pair (`stockfish-19-lite-single.js` and `.wasm`, about 1.8MB wasm). `frontend/scripts/copy-stockfish.mjs` copies those two files into `frontend/public/stockfish/` on `postinstall`. That directory is gitignored. Do not copy the 95MB NNUE binaries (`stockfish-19.wasm` / `stockfish-19-single.wasm`). The lite-single build does not need COOP/COEP headers.

Distributing a combined frontend build that includes the worker and wasm may require offering corresponding source under GPL terms, same class of issue as chessops.

## Secrets

`backend/.env` is gitignored. Copy `backend/.env.example` for local development. Do not commit real `JWT_SECRET` values.
