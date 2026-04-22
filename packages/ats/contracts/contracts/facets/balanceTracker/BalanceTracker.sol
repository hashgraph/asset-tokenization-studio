// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTracker } from "./IBalanceTracker.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title BalanceTracker
 * @notice Abstract implementation of `IBalanceTracker` that consolidates token balance and
 *         total supply queries into a single, time-aware read layer.
 * @dev Delegates all storage reads to `ERC1410StorageWrapper` and `ERC3643StorageWrapper`,
 *      passing the resolved timestamp from `TimeTravelStorageWrapper` to support
 *      non-triggered adjustment simulation. Intended to be inherited by `BalanceTrackerFacet`.
 */
abstract contract BalanceTracker is IBalanceTracker {
    /**
     * @notice Returns the total token balance of a token holder across all partitions,
     *         simulating non-triggered balance adjustments up to the current timestamp.
     * @dev Delegates to `ERC1410StorageWrapper.balanceOfAdjustedAt`. No state is mutated.
     * @param _tokenHolder The address of the token holder.
     * @return The adjusted total balance of the token holder at the current timestamp.
     */
    function balanceOf(address _tokenHolder) external view returns (uint256) {
        return ERC1410StorageWrapper.balanceOfAdjustedAt(_tokenHolder, TimeTravelStorageWrapper.getBlockTimestamp());
    }

    /**
     * @notice Returns the total token supply across all partitions, simulating non-triggered
     *         supply adjustments up to the current timestamp.
     * @dev Delegates to `ERC1410StorageWrapper.totalSupplyAdjustedAt`. No state is mutated.
     * @return The adjusted total supply at the current timestamp.
     */
    function totalSupply() external view returns (uint256) {
        return ERC1410StorageWrapper.totalSupplyAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    /**
     * @notice Returns the total balance held by an account across all partitions, including
     *         locked tokens, held tokens, and clearing amounts, simulating non-triggered
     *         adjustments up to the current timestamp.
     * @dev Delegates to `ERC3643StorageWrapper.getTotalBalanceForAdjustedAt`. No state is mutated.
     * @param _account The address of the account.
     * @return The adjusted total balance for the account at the current timestamp.
     */
    function getTotalBalanceFor(address _account) external view returns (uint256) {
        return
            ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(_account, TimeTravelStorageWrapper.getBlockTimestamp());
    }
}
