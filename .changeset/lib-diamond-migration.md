---
"@hashgraph/asset-tokenization-contracts": major
---

Architectural migration: library-based Diamond pattern (BBND-1458 / BBND-1459 / BBND-1460). Converts every storage wrapper from an abstract contract to a library, consolidates modifiers into `CoreModifiers` and `AssetModifiers` aggregators under `services/`, introduces `EvmAccessors` for `msg.sender` abstraction (replacing the old `TimestampProvider` / direct `msg.sender` usage), and reorganizes the contracts tree into `domain/` (core + asset), `facets/` (layer_1 / layer_2 / layer_3) and `infrastructure/` (diamond, proxy, utils). Existing storage slots and public facet entry points are preserved, so downstream ABIs for already-deployed tokens remain compatible — the major bump signals the internal rewrite and the removal of the top-level `addCorporateAction` / `cancelCorporateAction` external functions (replaced by per-action commands).
