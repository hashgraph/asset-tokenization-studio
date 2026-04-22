// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTracker } from "./IBalanceTracker.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

abstract contract BalanceTracker is IBalanceTracker {
    function balanceOf(address _tokenHolder) external view returns (uint256) {
        return ERC1410StorageWrapper.balanceOfAdjustedAt(_tokenHolder, TimeTravelStorageWrapper.getBlockTimestamp());
    }

    function totalSupply() external view returns (uint256) {
        return ERC1410StorageWrapper.totalSupplyAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    function getTotalBalanceFor(address _account) external view returns (uint256) {
        return
            ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(_account, TimeTravelStorageWrapper.getBlockTimestamp());
    }
}
