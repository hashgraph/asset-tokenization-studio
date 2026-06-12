---
"@hashgraph/asset-tokenization-contracts": major
---

Architectural migration to the library-based Diamond pattern (BBND-1458/1459/1460): every storage wrapper becomes a library, modifiers consolidate into `CoreModifiers`/`AssetModifiers` aggregators under `services/`, a new `EvmAccessors` abstracts `msg.sender` (replacing `TimestampProvider`/direct `msg.sender`), and the contracts tree is reorganised into `domain/`, `facets/` and `infrastructure/`. Existing storage slots and public facet entry points are preserved so deployed-token ABIs stay compatible; the major bump reflects the internal rewrite and the removal of the top-level `addCorporateAction`/`cancelCorporateAction` functions (replaced by per-action commands).
