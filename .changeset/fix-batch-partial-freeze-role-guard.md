---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: `batchFreezePartialTokens` and `batchUnfreezePartialTokens` lacked the `onlyFreezeRoles` guard present on their single-holder equivalents, allowing any unprivileged caller to freeze or release arbitrary holders' transferable balances without `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`.

Add `onlyFreezeRoles(EvmAccessors.getMsgSender())` to both functions in `BatchFreeze.sol`, consistent with `batchSetAddressFrozen` in the same contract and with `freezePartialTokens` / `unfreezePartialTokens` in `Freeze.sol`.
