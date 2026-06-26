---
"@hashgraph/asset-tokenization-contracts": patch
---

chore: add a custom `solhint-plugin-ats` with house-style lint rules (msg.sender/block.timestamp accessors, parameter/return underscore conventions, ERC-7201 storage layout, no solhint-disable, etc.) plus a `conventions/` doc set and the `ats-style-guide` skill that enforces them. Apply the resulting fixes across contracts and mocks so the codebase lints clean under the new ruleset.
