# Contributing

Development workflow for rustic-knights lives under `docs/git/`:

- [Branching (Git Flow)](docs/git/workflow.md)
- [Commit messages](docs/git/commits.md)
- [Versioning](docs/git/versioning.md)
- [Licensing](docs/git/licensing.md)
- [Browser UI QA](docs/git/browser-qa.md)

Setup:

```
npm install
```

That installs Husky hooks (`pre-commit`, `commit-msg`, `pre-push`). Run the frontend with `npm run dev`.

Pull requests: use `.github/PULL_REQUEST_TEMPLATE.md`. Target `develop` for features and `main` for hotfixes.

License: MIT (see `LICENSE`). Chess piece GLTF is CC-BY-4.0 (see `docs/git/licensing.md`).
