# Rustic Knights design knowledge base

This directory is the design source of truth for the Babylon.js chess client and the Rust Actix backend. Each note records **current** prototype behavior and the **target** for later implementation.

Code remains authoritative for numbers that already exist in the repo. When docs and code disagree, update the docs.

## Reading order

1. [ROADMAP.md](ROADMAP.md) - phases, keep/delete, Rust decision
2. [architecture/decisions.md](architecture/decisions.md) - locked product choices
3. [architecture/overview.md](architecture/overview.md) - React vs Babylon vs Rust
4. [mechanics/rules.md](mechanics/rules.md) and [mechanics/game-modes.md](mechanics/game-modes.md)
5. [visual/](visual/) then [rendering/](rendering/) then [camera/](camera/)
6. [git/workflow.md](git/workflow.md) - Git Flow, hooks, SemVer, MIT
7. [git/browser-qa.md](git/browser-qa.md) - cursor-ide-browser UI verification

## Layout

```
docs/
  README.md
  ROADMAP.md
  architecture/
    overview.md
    decisions.md
  mechanics/
    rules.md
    game-modes.md
  visual/
    environment.md
    palette.md
  rendering/
    components.md
    meshes.md
    animations.md
  camera/
    settings.md
    controls.md
  git/
    workflow.md
    commits.md
    versioning.md
    licensing.md
    browser-qa.md
```

## Related files outside docs

- Prototype backlog: `TODO.md` (pause, mobile, bot, multiplayer)
- Contributing / Git Flow: `CONTRIBUTING.md` and `docs/git/`
- Run frontend: root `README.md` (`npm install`, `cd frontend`, `npm run dev`)
- Scene entry: `frontend/src/game/elements/GameScene.ts`
- Palette: `frontend/src/util/constants.ts`
- Backend entry: `backend/src/main.rs`
