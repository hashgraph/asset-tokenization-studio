// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTracker, RESOLVER_KEY_BALANCE_TRACKER } from "./IBalanceTracker.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title BalanceTracker
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IBalanceTracker` that consolidates token balance and
 *         total supply queries into a single, time-aware read layer.
 * @dev Delegates all storage reads to `ERC1410StorageWrapper` and `TokenCoreOps`,
 *      passing the resolved timestamp from `EvmAccessors` to support
 *      non-triggered adjustment simulation. Intended to be inherited by `BalanceTrackerFacet`.
 */
abstract contract BalanceTracker is IBalanceTracker, Modifiers {
    /// @inheritdoc IBalanceTracker
    function initializeBalanceTracker()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_BALANCE_TRACKER)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_BALANCE_TRACKER);
        emit IBalanceTracker.BalanceTrackerInitialized();
    }

    /**
     * @notice Returns the total token balance of a token holder across all partitions,
     *         simulating non-triggered balance adjustments up to the current timestamp.
     * @dev Delegates to `ERC1410StorageWrapper.balanceOfAdjustedAt`. No state is mutated.
     * @param _tokenHolder The address of the token holder.
     * @return The adjusted total balance of the token holder at the current timestamp.
     */
    function balanceOf(address _tokenHolder) external view returns (uint256) {
        return ERC1410StorageWrapper.balanceOfAdjustedAt(_tokenHolder, EvmAccessors.getBlockTimestamp());
    }

    /**
     * @notice Returns the total token supply across all partitions, simulating non-triggered
     *         supply adjustments up to the current timestamp.
     * @dev Delegates to `ERC1410StorageWrapper.totalSupplyAdjustedAt`. No state is mutated.
     * @return The adjusted total supply at the current timestamp.
     */
    function totalSupply() external view returns (uint256) {
        return ERC1410StorageWrapper.totalSupplyAdjustedAt(EvmAccessors.getBlockTimestamp());
    }

    /**
     * @notice Returns the total balance held by an account across all partitions, including
     *         locked tokens, held tokens, and clearing amounts, simulating non-triggered
     *         adjustments up to the current timestamp.
     * @dev Delegates to `TokenCoreOps.getTotalBalanceForAdjustedAt`. No state is mutated.
     * @param _account The address of the account.
     * @return The adjusted total balance for the account at the current timestamp.
     */
    function getTotalBalanceFor(address _account) external view returns (uint256) {
        return TokenCoreOps.getTotalBalanceForAdjustedAt(_account, EvmAccessors.getBlockTimestamp());
    }
}
