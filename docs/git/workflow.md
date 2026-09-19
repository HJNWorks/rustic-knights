# Branching workflow

Rustic Knights uses Git Flow with `main` as production and `develop` as integration. Numbered `release/*` branches are not used. Merging `develop` into `main` is the release. [semantic-release](versioning.md) then tags `vX.Y.Z` from conventional commits.

Remote: `https://github.com/HJNWorks/rustic-knights.git`

```
feature/*  -->  develop  --PR-->  main  -->  GitHub Release (tag)
hotfix/*   -->  main  -->  develop
```

## Branches

| Branch | Role |
|--------|------|
| `main` | Production. Merge only from `develop` or `hotfix/*`. CI runs lint, typecheck, build, then semantic-release |
| `develop` | Integration. All feature work lands here. CI runs lint, typecheck, build. No publish |
| `feature/<short-name>` | From `develop`. Open a PR back to `develop` |
| `hotfix/<short-name>` | From `main`. PR into `main`, then merge `main` into `develop` |

Do not commit directly to `main` or `develop` when a PR is the normal path. Do not force-push either branch.

## Feature work

```
git checkout develop
git pull
git checkout -b feature/short-name
```

Open a pull request targeting `develop`. Use the template in `.github/PULL_REQUEST_TEMPLATE.md`.

## Release

1. Open a PR from `develop` to `main`.
2. After merge, the `release` job on `main` runs semantic-release.
3. Merge `main` back into `develop` if the release commit (changelog / version bump) is not already there.

## Hotfix

```
git checkout main
git pull
git checkout -b hotfix/short-name
```

PR into `main`. After the release job, merge `main` into `develop`.

## CI

Workflow: `.github/workflows/ci.yml`

- Triggers: push and pull request to `main` and `develop`
- `lint-and-build`: Node 20, `npm ci`, lint, typecheck, build
- `release`: only on push to `main`

Rust `cargo check` is not in CI yet (`tch` still blocks a clean backend build).

GitHub branch protection (require PRs on `main` and `develop`) is set in the repository settings UI, not in this repo.

See also [commits.md](commits.md) and [versioning.md](versioning.md).
