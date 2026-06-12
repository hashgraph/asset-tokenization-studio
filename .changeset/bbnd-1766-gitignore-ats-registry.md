---
"@hashgraph/asset-tokenization-contracts": major
---

Stop tracking the auto-generated `scripts/domain/atsRegistry.data.ts` in git: it is renamed to `atsRegistry.generated.ts`, gitignored, and regenerated on every `npm install`/`npm ci` via a `prepare` hook that runs `npx hardhat compile`. Role hashes are split into a small sibling `atsRoles.generated.ts` that **is** checked in, so role-hash changes stay visible in PR diffs for audit. `atsRegistry.ts` exposes the data through lazy helpers and `Proxy`-backed raw exports so the bootstrap chain never touches the gitignored file at module load.

Breaking (for consumers of `@hashgraph/asset-tokenization-contracts/scripts`): the `FACET_REGISTRY_COUNT` and `STORAGE_WRAPPER_REGISTRY_COUNT` constants become the functions `getFacetRegistryCount()` and `getStorageWrapperRegistryCount()`. The raw `FACET_REGISTRY`, `INFRASTRUCTURE_CONTRACTS`, `STORAGE_WRAPPER_REGISTRY`, and `ROLES` exports keep their names and types.
