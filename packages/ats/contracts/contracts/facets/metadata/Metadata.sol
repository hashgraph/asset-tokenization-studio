// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMetadata } from "./IMetadata.sol";
import { METADATA_MANAGER_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { MetadataStorageWrapper } from "../../domain/core/MetadataStorageWrapper.sol";

/**
 * @title Metadata
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing arbitrary key/value metadata storage for a security
 *         token, where each key maps to an ordered list of byte payloads.
 * @dev Implements `IMetadata`. Metadata state is stored at `_METADATA_STORAGE_POSITION` via
 *      `MetadataStorageWrapper`. Write access is gated by `METADATA_MANAGER_ROLE` and the
 *      `onlyUnpaused` modifier; reads are unrestricted. Each `setMetadata` call replaces the
 *      entire array under the key. Intended to be inherited exclusively by `MetadataFacet`.
 */
abstract contract Metadata is IMetadata, Modifiers {
    /// @inheritdoc IMetadata
    /// @dev Requires `METADATA_MANAGER_ROLE` and the token to be unpaused. Delegates persistence
    ///      to `MetadataStorageWrapper.setMetadata`, which overwrites any existing array.
    function setMetadata(
        bytes32 _key,
        bytes[] calldata _value
    ) external onlyActivated onlyUnpaused onlyRole(METADATA_MANAGER_ROLE) {
        MetadataStorageWrapper.setMetadata(_key, _value);
    }

    /// @inheritdoc IMetadata
    function getMetadata(bytes32 _key) external view returns (bytes[] memory value_) {
        value_ = MetadataStorageWrapper.getMetadata(_key);
    }
}
