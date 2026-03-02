# Version Control Documentation (LO III)

## Branching Strategy
- `main` : stable version
- `feature/<name>` : new features and modifications

## Commit Message Convention
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `chore:` maintenance/config

## Workflow Used
1. Create feature branch: `feature/<name>`
2. Make changes + commit locally
3. Push branch to GitHub
4. Open Pull Request (PR)
5. Merge PR into `main`
6. Tag a version release (v1.0, v1.1, ...)

## Daily Version Log
| Date | Version | Branch | Change Summary | Evidence |
|------|---------|--------|----------------|---------|
| 2026-03-02 | v1.0 | main | Initial upload + setup | Tag v1.0 |
| 2026-03-03 | v1.1 | feature/... | (your change) | PR # |
| 2026-03-04 | v1.2 | feature/... | (your change) | PR # |