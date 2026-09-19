# Versioning

The project uses [Semantic Versioning](https://semver.org/) `MAJOR.MINOR.PATCH`. Current series: **0.1.0**.

Versions are **not** edited by hand on `main`. [semantic-release](https://semantic-release.gitbook.io/) runs on push to `main` after `lint-and-build` succeeds.

## How a version is chosen

From conventional commits since the last tag (`vX.Y.Z`):

| Commits since last tag | Bump |
|------------------------|------|
| `fix:` | patch (`0.1.0` -> `0.1.1`) |
| `feat:` | minor (`0.1.0` -> `0.2.0`) |
| `BREAKING CHANGE:` or `type!:` | major (`0.2.0` -> `1.0.0`) |

`docs`, `chore`, `ci`, `style`, `test`, and `refactor` do not bump the version. If a merge to `main` has none of `feat` / `fix` / breaking, semantic-release publishes nothing.

## What the release job writes

Config: `.releaserc.json`

- Tag `v${version}` on `main`
- `CHANGELOG.md`
- Version fields in root `package.json` and `frontend/package.json` (npm plugin, `npmPublish: false`)
- Commit of those files via `@semantic-release/git`
- GitHub Release via `@semantic-release/github`

The package is `private`. Nothing is published to the npm registry.

## First tag

semantic-release treats a repo with **no tags** as a first release of **1.0.0**. After this workflow landed, create an annotated tag on the then-current `main`:

```
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```

Then the next `feat` on `main` becomes `0.2.0` and the next `fix` becomes `0.1.1`.

## Git Flow

Release from `develop` -> `main` only. `develop` does not get npm tags. See [workflow.md](workflow.md).
