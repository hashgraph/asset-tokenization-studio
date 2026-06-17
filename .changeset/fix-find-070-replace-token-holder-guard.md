---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-070: `ERC1410StorageWrapper.replaceTokenHolder` resolved an unregistered `oldTokenHolder` to index 0 (valid indices start at 1) and would overwrite `tokenHolders[0]` with the new holder and zero the old mapping entry, irreversibly corrupting the registry. An existence check now reverts with the new `IERC1410Types.TokenHolderNotFound(oldTokenHolder)` error before any storage mutation when the resolved index is 0. Adds a mock harness and guard tests.
