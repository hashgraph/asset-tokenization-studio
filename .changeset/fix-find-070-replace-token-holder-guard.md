---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-070: `replaceTokenHolder` silently corrupts `tokenHolders[0]` when `oldTokenHolder` is unregistered.

`ERC1410StorageWrapper.replaceTokenHolder` looked up the old holder's index via `tokenHolderIndex[oldTokenHolder]`, which returns 0 for any unregistered address. Calling the function with an unregistered `oldTokenHolder` would overwrite `tokenHolders[0]` (the null slot, as valid indices start at 1) with `newTokenHolder` and zero out the old holder's mapping entry, corrupting the registry irreversibly without a manual storage fix.

Added an existence check that reverts with `IERC1410Types.TokenHolderNotFound(oldTokenHolder)` when the resolved index is 0, before any storage mutation occurs. The new custom error `TokenHolderNotFound(address tokenHolder)` is declared in `IERC1410Types`.

Added `MockERC1410StorageWrapper` test harness and three unit tests (two unhappy-path, one happy-path) covering the guard in the `SecurityHoldersFacet Tests` suite.
