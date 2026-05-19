---
"@hashgraph/asset-tokenization-contracts": major
---

Stop tracking the auto-generated `scripts/domain/atsRegistry.data.ts` in git
and ship the heavy facet/contract/storage-wrapper registry through the
package's `build/` output instead. The file is renamed to
`scripts/domain/atsRegistry.generated.ts`, gitignored, and regenerated on
every `npm install` / `npm ci` via a new `prepare` hook that runs
`npx hardhat compile`.

Role hashes are now emitted into a small sibling file,
`scripts/domain/atsRoles.generated.ts`, which **is** checked into git so
role-hash changes remain visible in PR diffs for audit.

`scripts/domain/atsRegistry.ts` exposes the registry data through lazy
helpers and `Proxy`-backed raw exports so the bootstrap chain
(`hardhat.config.ts` → tasks → `@scripts` barrel) never touches the
gitignored file at module load.

Breaking surface for downstream consumers of
`@hashgraph/asset-tokenization-contracts/scripts`:

- `FACET_REGISTRY_COUNT` (constant) → `getFacetRegistryCount()` (function).
- `STORAGE_WRAPPER_REGISTRY_COUNT` (constant) → `getStorageWrapperRegistryCount()`
  (function).

The raw `FACET_REGISTRY`, `INFRASTRUCTURE_CONTRACTS`,
`STORAGE_WRAPPER_REGISTRY`, and `ROLES` exports remain available with their
existing names and types; they are now backed by lazy proxies / a checked-in
roles file rather than direct re-exports.
