---
"@hashgraph/asset-tokenization-contracts": major
---

refactor(facets): remove `ERC1410ManagementFacet` and `ERC3643ManagementFacet` (BBND-1821).

Both facets existed solely to host a single-shot initialiser. Under the centralised initializer system, each capability already had its own readiness initialiser on the natural-owner facet, so the management facets were redundant. Their data-carrying initialisers are folded into those owner facets, dropping two facets, two resolver keys and two interface ids from the diamond.

- `ERC1410ManagementFacet` removed. `PartitionsFacet.initializePartitions` now takes the `bool multiPartition` argument and writes it to ERC-1410 storage before marking the facet ready.
- `ERC3643ManagementFacet` removed. Its compliance/identity wiring is split into `ComplianceFacet.initializeCompliance(address)` and `IdentityFacet.initializeIdentity(address)`.
- `initializeCompliance`, `initializeIdentity` and `initializePartitions` now emit their `*Initialized` events with the wired value. One-shot semantics stay enforced by the centralised `onlyFacetNotRegistered` guard; no per-namespace storage flags are introduced.
- `IERC3643` no longer inherits `IERC3643Management`; `IAsset` no longer inherits `IERC1410Management`. The factory bootstrap calls the three owner-facet initialisers directly.

Breaking impact: deployments must be regenerated. The `RESOLVER_KEY_ERC1410_MANAGEMENT` and `RESOLVER_KEY_ERC3643_MANAGEMENT` facets, keys and interface ids are removed, and the `initialize{Partitions,Compliance,Identity}` selectors change signature. No storage-layout change.
