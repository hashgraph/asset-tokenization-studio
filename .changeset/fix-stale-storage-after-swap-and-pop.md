---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix stale storage slots left behind by swap-and-pop removal in two registries. `ERC1410StorageWrapper.removeTokenHolder` moved the last holder into the vacated slot and decremented the counter but never `delete`d the old tail slot, leaving a phantom holder address readable directly; and `DocumentationStorageWrapper.removeDocumentEntry` deleted the document but not its `docIndexes` entry, leaving a stale index pointing at a different document. Both now issue the missing `delete`, with storage-level regression tests asserting the affected mapping slot is zero after removal.
