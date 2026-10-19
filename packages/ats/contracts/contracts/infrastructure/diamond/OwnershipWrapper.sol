// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EvmAccessors } from "../utils/EvmAccessors.sol";
import { IOwnership } from "./IOwnership.sol";

/**
 * @dev Must remain stable across upgrades to preserve ownership state for all configurations.
 */
/// @custom:hash storage Ownership
bytes32 constant STORAGE_LOCATION_OWNERSHIP = 0x0c49888622360137ef830a76ef93872bc0aefaf60fb012c3941df4da0397c000;

/**
 * @title Ownership Wrapper
 * @notice Provides internal storage and helpers for per-configuration two-step ownership.
 * @dev Uses a fixed diamond storage slot and tracks owners independently by configuration id.
 *      Mutating helpers are internal and rely on inheriting facets to enforce call flow.
 * @author Asset Tokenization Studio Team
 */
abstract contract OwnershipWrapper {
    /**
     * @notice Stores current and pending owners for each configuration.
     * @dev Anchored at {STORAGE_LOCATION_OWNERSHIP}. New fields must be appended to preserve
     *      the storage layout for upgradeable diamond deployments.
     * @param configOwners Current owner address keyed by configuration id.
     * @param configPendingOwners Nominated successor address keyed by configuration id.
     */
    struct OwnershipStorage {
        mapping(bytes32 configId => address owner) configOwners;
        mapping(bytes32 configId => address pendingOwner) configPendingOwners;
    }

    /**
     * @notice Restricts execution to the current owner of a configuration.
     * @dev Reverts with {IOwnership.NotOwner} if the caller is not the stored owner.
     *      Uninitialised configurations are rejected because their owner is the zero address.
     * @param _configId Configuration whose owner must match the caller.
     */
    modifier onlyConfigurationOwner(bytes32 _configId) {
        _checkOwnership(_configId);
        _;
    }

    /**
     * @notice Restricts execution to the pending owner of a configuration.
     * @dev Reverts with {IOwnership.NotPendingOwner} if the caller is not the nominated
     *      pending owner. Calls also fail when no transfer is pending.
     * @param _configId Configuration whose pending owner must match the caller.
     */
    modifier onlyConfigurationPendingOwner(bytes32 _configId) {
        _checkPendingOwnership(_configId);
        _;
    }

    /**
     * @notice Sets the current owner for a configuration.
     * @dev Overwrites the owner slot without validation. Callers must enforce authorisation
     *      and ensure the ownership transition is valid before invoking this helper.
     * @param _configId Configuration whose owner is updated.
     * @param _owner Address recorded as the current owner.
     */
    function _setOwner(bytes32 _configId, address _owner) internal {
        _ownershipStorage().configOwners[_configId] = _owner;
    }

    /**
     * @notice Sets the pending owner for a configuration.
     * @dev Overwrites any previous nomination and does not mutate the current owner.
     *      Ownership is not transferred until the pending owner is accepted by higher-level
     *      logic.
     * @param _configId Configuration whose pending owner is updated.
     * @param _pendingOwner Address nominated to become the next owner.
     */
    function _setPendingOwner(bytes32 _configId, address _pendingOwner) internal {
        _ownershipStorage().configPendingOwners[_configId] = _pendingOwner;
    }

    /**
     * @notice Clears the pending owner for a configuration.
     * @dev Deletes the nomination so pending-owner checks fail until a new pending owner is
     *      set. Used after successful acceptance or cancellation.
     * @param _configId Configuration whose pending owner is removed.
     */
    function _removePendingOwner(bytes32 _configId) internal {
        delete _ownershipStorage().configPendingOwners[_configId];
    }

    /**
     * @notice Returns the current owner of a configuration.
     * @dev Reads ownership storage without validating whether the configuration is initialised.
     * @param _configId Configuration to query.
     * @return owner_ Current owner address, or the zero address when unset.
     */
    function _getOwner(bytes32 _configId) internal view returns (address owner_) {
        owner_ = _ownershipStorage().configOwners[_configId];
    }

    /**
     * @notice Returns the pending owner of a configuration.
     * @dev Reads ownership storage without validating whether a transfer is currently pending.
     * @param _configId Configuration to query.
     * @return pendingOwner_ Pending owner address, or the zero address when none is set.
     */
    function _getPendingOwner(bytes32 _configId) internal view returns (address pendingOwner_) {
        pendingOwner_ = _ownershipStorage().configPendingOwners[_configId];
    }

    /**
     * @notice Validates that the caller is the current owner of a configuration.
     * @dev Uses {EvmAccessors.getMsgSender} for caller resolution and reverts with
     *      {IOwnership.NotOwner} on mismatch.
     * @param _configId Configuration whose ownership is checked.
     */
    function _checkOwnership(bytes32 _configId) internal view {
        address owner = _getOwner(_configId);
        address sender = EvmAccessors.getMsgSender();
        if (owner != sender) {
            revert IOwnership.NotOwner(_configId, sender, owner);
        }
    }

    /**
     * @notice Validates that the caller is the pending owner of a configuration.
     * @dev Uses {EvmAccessors.getMsgSender} for caller resolution and reverts with
     *      {IOwnership.NotPendingOwner} on mismatch.
     * @param _configId Configuration whose pending ownership is checked.
     */
    function _checkPendingOwnership(bytes32 _configId) internal view {
        address pendingOwner = _getPendingOwner(_configId);
        address sender = EvmAccessors.getMsgSender();
        if (pendingOwner != sender) {
            revert IOwnership.NotPendingOwner(_configId, sender, pendingOwner);
        }
    }

    /**
     * @notice Returns the ownership storage pointer.
     * @dev Binds the storage pointer to {STORAGE_LOCATION_OWNERSHIP} using the diamond
     *      storage pattern. This function does not read or mutate state by itself.
     * @return os_ Storage pointer for the ownership layout.
     */
    function _ownershipStorage() private pure returns (OwnershipStorage storage os_) {
        bytes32 position = STORAGE_LOCATION_OWNERSHIP;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            os_.slot := position
        }
    }
}
