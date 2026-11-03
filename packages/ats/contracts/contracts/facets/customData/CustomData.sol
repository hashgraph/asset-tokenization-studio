// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICustomData, RESOLVER_KEY_CUSTOM_DATA } from "./ICustomData.sol";
import { ROLE_CUSTOM_DATA_MANAGER } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { CustomDataStorageWrapper } from "../../domain/core/CustomDataStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title CustomData
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing arbitrary key/value custom data storage for a security
 *         token, where each key maps to an ordered list of byte payloads.
 * @dev Implements `ICustomData`. Custom data state is stored at `STORAGE_LOCATION_CUSTOM_DATA` via
 *      `CustomDataStorageWrapper`. Write access is gated by `ROLE_CUSTOM_DATA_MANAGER` and the
 *      `onlyUnpaused` modifier; reads are unrestricted. Each `setCustomData` call replaces the
 *      entire array under the key. Intended to be inherited exclusively by `CustomDataFacet`.
 */
abstract contract CustomData is ICustomData, Modifiers {
    /// @inheritdoc ICustomData
    function initializeCustomData(
        ICustomData.CustomDataEntry[] calldata _entries
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_CUSTOM_DATA) {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_CUSTOM_DATA);
        CustomDataStorageWrapper.setCustomDataBatch(_entries);
        emit CustomDataInitialized(_entries);
    }

    /// @inheritdoc ICustomData
    /// @dev Requires `ROLE_CUSTOM_DATA_MANAGER` and the token to be unpaused. Delegates persistence
    ///      to `CustomDataStorageWrapper.setCustomData`, which overwrites any existing array, then
    ///      emits `CustomDataSet`.
    function setCustomData(
        bytes32 _key,
        bytes[] calldata _value
    ) external onlyOperational onlyActivated onlyUnpaused onlyRole(ROLE_CUSTOM_DATA_MANAGER) {
        CustomDataStorageWrapper.setCustomData(_key, _value);
        emit CustomDataSet(_key, _value);
    }

    /// @inheritdoc ICustomData
    /// @dev Delegates all writes to `CustomDataStorageWrapper.setCustomDataBatch`, then emits a
    ///      single `CustomDataBatchSet` event. An empty `_entries` array is a silent no-op.
    function setCustomDataBatch(
        ICustomData.CustomDataEntry[] calldata _entries
    ) external onlyOperational onlyActivated onlyUnpaused onlyRole(ROLE_CUSTOM_DATA_MANAGER) {
        CustomDataStorageWrapper.setCustomDataBatch(_entries);
        emit CustomDataBatchSet(_entries);
    }

    /// @inheritdoc ICustomData
    function getCustomData(bytes32 _key) external view returns (bytes[] memory value_) {
        value_ = CustomDataStorageWrapper.getCustomData(_key);
    }
}
