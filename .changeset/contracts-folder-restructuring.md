---
"@hashgraph/asset-tokenization-contracts": minor
---

Restructure contracts folder layout for DDD alignment:

- Reorganize `layer_0/` into `domain/` with `core/` and `asset/` split, drop `Lib` prefix from all domain files
- Move `layer_1/`, `layer_2/`, `layer_3/` under `facets/` directory
- Build `infrastructure/` from `resolver/` and `proxies/` with `diamond/`, `proxy/`, and `utils/` subdirectories
- Consolidate all scattered `constants/` into root `constants/` directory
- Move `mocks/` and test-only contracts into `test/mocks/`
- Colocate all interfaces next to their implementations (remove centralized `interfaces/` directories)
- Rename plural feature folders to singular (`snapshots/` → `snapshot/`, `nonces/` → `nonce/`, etc.)
