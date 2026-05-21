// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMetadata, METADATA_RESOLVER_KEY } from "./IMetadata.sol";
import { ROLE_METADATA_MANAGER } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { MetadataStorageWrapper } from "../../domain/core/MetadataStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Metadata
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing arbitrary key/value metadata storage for a security
 *         token, where each key maps to an ordered list of byte payloads.
 * @dev Implements `IMetadata`. Metadata state is stored at `STORAGE_LOCATION_METADATA` via
 *      `MetadataStorageWrapper`. Write access is gated by `ROLE_METADATA_MANAGER` and the
 *      `onlyUnpaused` modifier; reads are unrestricted. Each `setMetadata` call replaces the
 *      entire array under the key. Intended to be inherited exclusively by `MetadataFacet`.
 */
abstract contract Metadata is IMetadata, Modifiers {
    /// @inheritdoc IMetadata
    function initializeMetadata()
    external
    override
    onlyRole(DEFAULT_ADMIN_ROLE)
    onlyFacetNotRegistered(_METADATA_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_METADATA_RESOLVER_KEY);
        emit MetadataInitialized();
    }

    /// @inheritdoc IMetadata
    /// @dev Requires `ROLE_METADATA_MANAGER` and the token to be unpaused. Delegates persistence
    ///      to `MetadataStorageWrapper.setMetadata`, which overwrites any existing array.
    function setMetadata(
        bytes32 _key,
        bytes[] calldata _value
    ) external onlyActivated onlyUnpaused onlyRole(ROLE_METADATA_MANAGER) {
        MetadataStorageWrapper.setMetadata(_key, _value);
    }

    /// @inheritdoc IMetadata
    function getMetadata(bytes32 _key) external view returns (bytes[] memory value_) {
        value_ = MetadataStorageWrapper.getMetadata(_key);
    }
}
