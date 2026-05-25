---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-071: `removeTokenHolder` did not validate that the holder was registered before executing removal, causing silent state corruption and incorrect holder count when called for non-existent holders. Add `_checkUnexpectedError` guard on `tokenHolderIndex == 0` using new `KPI_ERC1410_REMOVE_HOLDER` error ID.
