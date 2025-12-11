---
"@hashgraph/asset-tokenization-contracts": patch
"@hashgraph/asset-tokenization-sdk": patch
---

fix: CI workflow improvements for reliable releases

1. **Fixed --ignore pattern in ats.release.yml**: Changed from non-existent
   `@hashgraph/mass-payout*` to correct `@mass-payout/*` package namespace

2. **Simplified publish trigger in ats.publish.yml**: Changed from
   `release: published` to `push.tags` for automatic publishing on tag push
   (no need to manually create GitHub release)

3. **Removed recursive publish scripts**: Removed `"publish": "npm publish"`
   from contracts and SDK package.json files that caused npm to recursively
   call itself during publish lifecycle, resulting in 403 errors in CI
