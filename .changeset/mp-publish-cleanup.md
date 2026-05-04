---
"@hashgraph/mass-payout-backend": patch
---

chore(mp): remove unused publish workflow and pin ATS SDK dependency

- Removed `301-flow-mp-publish.yaml`. Mass Payout packages are private (`"private": true` since the first MP commit) and have never been published to npm; the workflow's pack step always skipped them. The release workflow (`003-user-mp-release.yaml`) remains active for tag creation and GitHub release pages.
- Pinned `@hashgraph/asset-tokenization-sdk` in `apps/mass-payout/backend` from `"*"` to `"^7.0.0"`. The wildcard worked via workspace symlinks but signalled an undefined version contract; the explicit semver range mirrors the in-repo ATS version and must be bumped alongside future ATS major releases.
