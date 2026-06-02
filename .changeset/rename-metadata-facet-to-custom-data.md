---
"@hashgraph/asset-tokenization-contracts": major
---

Rename `MetadataFacet` to `CustomDataFacet` across the entire contracts package.

**Renamed facet stack**
`IMetadata`, `Metadata`, and `MetadataFacet` are replaced by `ICustomData`, `CustomData`, and `CustomDataFacet` respectively, located under `contracts/facets/customData/`. `MetadataStorageWrapper` is renamed to `CustomDataStorageWrapper` under `contracts/domain/core/`.

**Breaking: ABI changes**
`setMetadata(bytes32,bytes[])` → `setCustomData(bytes32,bytes[])` and `getMetadata(bytes32)` → `getCustomData(bytes32)`. Any on-chain or off-chain caller must update to the new selectors.

**Breaking: role hash change**
`ROLE_METADATA_MANAGER` (`0x4f7e...6733`) is replaced by `ROLE_CUSTOM_DATA_MANAGER` (`0x0b34...01b0`). Any access-control grant issued under the old hash is no longer recognised by the facet. Re-grant under the new role after upgrading.

**Breaking: resolver key and storage slot change**
`RESOLVER_KEY_METADATA` → `RESOLVER_KEY_CUSTOM_DATA` (`0xfe75...a56`). `STORAGE_LOCATION_METADATA` → `STORAGE_LOCATION_CUSTOM_DATA` (`0x92ac...700`). Diamond configurations must register the facet under the new resolver key; existing storage is unreachable under the old slot.
