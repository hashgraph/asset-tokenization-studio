// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOwnership } from "./IOwnership.sol";
import { OwnershipWrapper } from "./OwnershipWrapper.sol";
import { Pause } from "../../facets/pause/Pause.sol";
import { EvmAccessors } from "../utils/EvmAccessors.sol";

/**
 * @title Ownership
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet implementing two-step ownership transfers per configuration.
 * @dev Composes {OwnershipWrapper} storage helpers with the pause gate from {Pause} so that
 *      ownership handovers are blocked while the diamond is paused. Each `configId` carries
 *      its own owner and pending owner, enabling multi-tenant configurations on a single
 *      diamond. State changes are emitted via {IOwnership} events; access is enforced by the
 *      `onlyConfigurationOwner` / `onlyConfigurationPendingOwner` modifiers inherited from
 *      {OwnershipWrapper}.
 */
abstract contract Ownership is IOwnership, Pause, OwnershipWrapper {
    /**
     * @inheritdoc IOwnership
     * @dev Gated by {onlyUnpaused}, {onlyConfigurationOwner} and {onlyCreateConfigurationRole}:
     *      only the existing owner can nominate a successor who was previously granted the
     *      ROLE_CREATE_CONFIGURATION, and only while the diamond is unpaused. Stores `_newOwner`
     *      as the pending owner without touching the current owner; finalisation happens in
     *      {acceptOwnership}. Emits {OwnershipTransfered} with the caller as the outgoing owner.
     */
    function transferOwnership(
        bytes32 _configId,
        address _newOwner
    ) external onlyUnpaused onlyConfigurationOwner(_configId) {
        _setPendingOwner(_configId, _newOwner);
        emit OwnershipTransfered(_configId, EvmAccessors.getMsgSender(), _newOwner);
    }

    /**
     * @inheritdoc IOwnership
     * @dev Gated by {onlyUnpaused} and {onlyConfigurationPendingOwner}: only the nominated
     *      pending owner can finalise the handover, and only while the diamond is unpaused.
     *      Snapshots the outgoing owner via {_getOwner} before overwriting it, promotes the
     *      caller to owner via {_setOwner}, and clears the pending slot via
     *      {_removePendingOwner}. Emits {OwnershipAccepted} with the captured previous owner
     *      and the caller as the new owner.
     */
    function acceptOwnership(bytes32 _configId) external onlyUnpaused onlyConfigurationPendingOwner(_configId) {
        address previousOwner = _getOwner(_configId);
        _setOwner(_configId, EvmAccessors.getMsgSender());
        _removePendingOwner(_configId);
        emit OwnershipAccepted(_configId, previousOwner, EvmAccessors.getMsgSender());
    }

    /// @inheritdoc IOwnership
    function getOwner(bytes32 _configId) external view returns (address owner_) {
        return _getOwner(_configId);
    }

    /// @inheritdoc IOwnership
    function getPendingOwner(bytes32 _configId) external view returns (address pendingOwner_) {
        return _getPendingOwner(_configId);
    }
}
