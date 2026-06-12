---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/asset-tokenization-sdk": major
"@hashgraph/asset-tokenization-dapp": major
---

Normalise every keccak-derived `bytes32` constant across the ATS contracts to a single mechanical rule — generic family first, specific name second — under a new canonical `asset.tokenization.standard.` prefix (was `security.token.standard.`). Roles become `ROLE_<NAME>`, resolver keys move to `RESOLVER_KEY_<NAME>` on each `I<Feature>`, storage locations become `STORAGE_LOCATION_<NAME>` derived via the ERC-7201 formula, and corporate-action/scheduled-task type ids and EIP-712 typehashes move to dedicated constants files. A new TypeScript codegen is the single source of truth, gated in CI by `hashes:check`.

Breaking: every on-chain role hash, namespaced storage slot, resolver key, and corporate-action/scheduled-task type id changes value, so existing role grants, deployed proxies, and BLR configurations are invalid and require a clean redeploy. EIP-712 typehashes are unchanged, and the SDK `SecurityRole` enum keeps its member names (only the hex literals change).
