---
"@hashgraph/asset-tokenization-contracts": major
---

Rename `MetadataFacet` to `CustomDataFacet` across the contracts package: `IMetadata`/`Metadata`/`MetadataFacet` become `ICustomData`/`CustomData`/`CustomDataFacet` and `MetadataStorageWrapper` becomes `CustomDataStorageWrapper`.

Breaking: `setMetadata`/`getMetadata` become `setCustomData`/`getCustomData` (new selectors); `ROLE_METADATA_MANAGER` becomes `ROLE_CUSTOM_DATA_MANAGER` (new hash, so existing grants must be re-issued); and `RESOLVER_KEY_METADATA`/`STORAGE_LOCATION_METADATA` become the `*_CUSTOM_DATA` variants, so diamond configurations must register under the new resolver key and existing storage is unreachable under the old slot.
