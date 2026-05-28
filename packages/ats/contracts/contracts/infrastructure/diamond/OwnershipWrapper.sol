// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EvmAccessors } from "../utils/EvmAccessors.sol";
import { IOwnership } from "./IOwnership.sol";

/// @custom:hash storage Ownership
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_OWNERSHIP = 0x0c49888622360137ef830a76ef93872bc0aefaf60fb012c3941df4da0397c000;

/**
 * @title OwnershipWrapper
 * @author Asset Tokenization Studio Team
 * @notice Internal storage and helpers backing per-configuration two-step ownership.
 * @dev Provides the fixed storage slot, modifiers and getters/setters used by the public
 *      {Ownership} facet. Ownership is tracked independently for each `configId`, allowing a
 *      single diamond to host multiple configurations with distinct owners. All mutating
 *      helpers are `internal` so only the inheriting facet can drive state changes.
 */
abstract contract OwnershipWrapper {
    /**
     * @notice Storage layout that holds owners and pending owners keyed by configuration id.
     * @dev Anchored at {STORAGE_LOCATION_OWNERSHIP} via inline assembly in
     *      {_ownershipStorage}. New fields must be appended to preserve the slot layout, as
     *      this struct is consumed by an upgradeable diamond facet.
     * @param configOwners Maps each configuration id to its current owner.
     * @param configPendingOwners Maps each configuration id to the address nominated to take
     *        ownership next.
     */
    struct OwnershipStorage {
        mapping(bytes32 configId => address owner) configOwners;
        mapping(bytes32 configId => address pendingOwner) configPendingOwners;
    }

    /**
     * @notice Restricts execution to the current owner of `_configId`.
     * @dev Reverts with {IOwnership.NotOwner} when the caller does not match the stored owner.
     *      Note that an unset configuration has the zero address as owner, so this modifier
     *      also blocks calls against uninitialised configurations.
     * @param _configId Configuration whose owner must match the caller.
     */
    modifier onlyConfigurationOwner(bytes32 _configId) {
        _checkOwnership(_configId);
        _;
    }

    /**
     * @notice Restricts execution to the pending owner of `_configId`.
     * @dev Reverts with {IOwnership.NotPendingOwner} when the caller does not match the
     *      stored pending owner. Implicitly blocks acceptance when no transfer is in flight,
     *      since the slot then holds the zero address.
     * @param _configId Configuration whose pending owner must match the caller.
     */
    modifier onlyConfigurationPendingOwner(bytes32 _configId) {
        _checkPendingOwnership(_configId);
        _;
    }

    /**
     * @notice Writes `_owner` as the current owner of `_configId`.
     * @dev Overwrites the owner slot unconditionally. Callers must enforce their own access
     *      control (e.g. {onlyConfigurationPendingOwner}) before invoking this helper, as it
     *      performs no checks of its own.
     * @param _configId Configuration whose owner slot is being written.
     * @param _owner Address to record as the new owner.
     */
    function _setOwner(bytes32 _configId, address _owner) internal {
        OwnershipStorage storage os = _ownershipStorage();
        os.configOwners[_configId] = _owner;
    }

    /**
     * @notice Records `_pendingOwner` as the nominated successor for `_configId`.
     * @dev Overwrites any previous nomination without clearing the current owner; the
     *      handover is only finalised by {_acceptOwnership}.
     * @param _configId Configuration whose pending owner slot is being written.
     * @param _pendingOwner Address to nominate as the next owner.
     */
    function _setPendingOwner(bytes32 _configId, address _pendingOwner) internal {
        OwnershipStorage storage os = _ownershipStorage();
        os.configPendingOwners[_configId] = _pendingOwner;
    }

    /**
     * @notice Clears the pending owner slot for `_configId`.
     * @dev Deletes the entry so {_getPendingOwner} returns the zero address. Used to close
     *      out a successful handover or to cancel a previously recorded nomination.
     * @param _configId Configuration whose pending owner slot is being cleared.
     */
    function _removePendingOwner(bytes32 _configId) internal {
        OwnershipStorage storage os = _ownershipStorage();
        delete os.configPendingOwners[_configId];
    }

    /**
     * @notice Reads the current owner of `_configId` from storage.
     * @param _configId Configuration to query.
     * @return owner_ Address recorded as owner, or the zero address when unset.
     */
    function _getOwner(bytes32 _configId) internal view returns (address owner_) {
        OwnershipStorage storage os = _ownershipStorage();
        owner_ = os.configOwners[_configId];
    }

    /**
     * @notice Reads the pending owner of `_configId` from storage.
     * @param _configId Configuration to query.
     * @return pendingOwner_ Address nominated as next owner, or the zero address when no
     *         transfer is in flight.
     */
    function _getPendingOwner(bytes32 _configId) internal view returns (address pendingOwner_) {
        OwnershipStorage storage os = _ownershipStorage();
        pendingOwner_ = os.configPendingOwners[_configId];
    }

    function _checkOwnership(bytes32 _configId) internal view {
        address owner = _getOwner(_configId);
        address sender = EvmAccessors.getMsgSender();
        if (owner != sender) {
            revert IOwnership.NotOwner(_configId, sender, owner);
        }
    }

    function _checkPendingOwnership(bytes32 _configId) internal view {
        address pendingOwner = _getPendingOwner(_configId);
        address sender = EvmAccessors.getMsgSender();
        if (pendingOwner != sender) {
            revert IOwnership.NotPendingOwner(_configId, sender, pendingOwner);
        }
    }

    /**
     * @notice Returns the {OwnershipStorage} struct anchored at the fixed slot.
     * @dev Uses inline assembly to bind the struct pointer to {STORAGE_LOCATION_OWNERSHIP},
     *      following the diamond storage pattern used across the codebase.
     * @return os Storage pointer to the ownership layout.
     */
    function _ownershipStorage() private pure returns (OwnershipStorage storage os) {
        bytes32 position = STORAGE_LOCATION_OWNERSHIP;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            os.slot := position
        }
    }
}
