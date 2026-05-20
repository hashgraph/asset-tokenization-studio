// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTrackerAdjusted } from "./IBalanceTrackerAdjusted.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BalanceTrackerAdjusted
 * @notice Abstract implementation of `IBalanceTrackerAdjusted` providing historical,
 *         timestamp-parameterised balance queries with non-triggered adjustment simulation.
 * @dev Delegates storage reads to `ERC1410StorageWrapper.balanceOfAdjustedAt`.
 *      Intended to be inherited by `BalanceTrackerAdjustedFacet`.
 */
abstract contract BalanceTrackerAdjusted is IBalanceTrackerAdjusted, Modifiers {
    /// @inheritdoc IBalanceTrackerAdjusted
    function initializeBalanceTrackerAdjusted()
        external
        override
        onlyFacetNotRegistered(_BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY)
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        InitializerStorageWrapper.setFacetToReady(_BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY);
        emit IBalanceTrackerAdjusted.BalanceTrackerAdjustedInitialized(EvmAccessors.getMsgSender());
    }

    /// @inheritdoc IBalanceTrackerAdjusted
    function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256) {
        return ERC1410StorageWrapper.balanceOfAdjustedAt(_tokenHolder, _timestamp);
    }
}
