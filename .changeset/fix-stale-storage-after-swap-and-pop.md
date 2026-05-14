---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix stale storage slots left behind by swap-and-pop removal in token holder and document registries.

**Ghost address in `ERC1410StorageWrapper.removeTokenHolder` (`ERC1410StorageWrapper.sol`)**
The swap-and-pop routine moved the last holder into the vacated slot and decremented `totalTokenHolders`, but never issued `delete basicStorage.tokenHolders[lastIndex]`. The mapping slot at the old `lastIndex` retained the address that had just been moved, creating a permanently stale entry. Any off-chain or on-chain consumer reading that slot directly received a phantom address. Adds the missing `delete` call after the counter decrement.

**Stale index entry in `DocumentationStorageWrapper.removeDocumentEntry` (`DocumentationStorageWrapper.sol`)**
After swap-and-pop removal, `delete docStorage.documents[_name]` was issued but `delete docStorage.docIndexes[_name]` was not. The `docIndexes` mapping kept a non-zero value pointing at the slot now occupied by a different document, leaving inconsistent state that could confuse off-chain tooling or future reads of the index. Adds the missing `delete docStorage.docIndexes[_name]` alongside the existing document delete.

**Regression tests**
Both fixes are covered by new storage-level tests that compute the affected mapping slot via `keccak256(key || mappingBaseSlot)` and assert the slot equals `bytes32(0)` after the removal operation. Tests are added to `SecurityHolders.test.ts` and `documentation.test.ts` respectively.
