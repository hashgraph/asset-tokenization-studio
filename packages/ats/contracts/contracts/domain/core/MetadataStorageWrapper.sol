// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _METADATA_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IMetadata } from "../../facets/metadata/IMetadata.sol";

struct MetadataDataStorage {
    mapping(bytes32 => bytes[]) metadata;
}

library MetadataStorageWrapper {
    function setMetadata(bytes32 _key, bytes[] calldata _value) internal {
        bytes[] storage stored = metadataStorage().metadata[_key];
        delete metadataStorage().metadata[_key];
        for (uint256 i = 0; i < _value.length; ++i) {
            stored.push(_value[i]);
        }
    }

    function getMetadata(bytes32 _key) internal view returns (bytes[] memory) {
        return metadataStorage().metadata[_key];
    }

    function metadataStorage() internal pure returns (MetadataDataStorage storage metadata_) {
        bytes32 position = _METADATA_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            metadata_.slot := position
        }
    }
}
