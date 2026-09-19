# Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). Husky `commit-msg` runs commitlint (`@commitlint/config-conventional`). A rejected message is not recorded.

## Format

```
type(scope): subject

optional body

optional footer
```

The subject is imperative, lowercase after the type, no trailing period. Keep the first line under 72 characters.

## Types

| Type | When |
|------|------|
| `feat` | User-visible behavior (minor bump) |
| `fix` | Bug fix (patch bump) |
| `docs` | Documentation only |
| `style` | Formatting, no behavior change |
| `refactor` | Code change that is not feat or fix |
| `perf` | Performance |
| `test` | Tests |
| `build` | Build tooling or dependencies |
| `ci` | GitHub Actions / hooks |
| `chore` | Maintenance that does not fit elsewhere |
| `revert` | Revert a previous commit |

## Scopes

If a scope is present, it must be one of:

- `frontend`
- `backend`
- `docs`
- `ci`

Examples:

```
feat(frontend): highlight legal moves from chessops
fix(backend): hash passwords on the in-memory register path
docs: record camera fov default
ci: run lint on develop
```

A scope is optional. `chore: ignore backend dotenv files` is valid.

## Breaking changes

Add a footer. semantic-release treats this as a **major** bump (from 0.x this cuts **1.0.0**):

```
feat(frontend): replace custom Move validation with chessops

BREAKING CHANGE: ChessGame.makeMove now takes UCI squares, not Piece/Square objects.
```

`feat!` / `fix!` in the type is also accepted by commitlint.

## Hooks

| Hook | Command |
|------|---------|
| `pre-commit` | `npx lint-staged` (ESLint + Prettier on staged `frontend/src` TS/TSX) |
| `commit-msg` | `npx commitlint --edit` |
| `pre-push` | `npm run typecheck` (frontend workspace) |

Hooks live in `.husky/`. `npm install` at the repo root runs `prepare: husky`.
