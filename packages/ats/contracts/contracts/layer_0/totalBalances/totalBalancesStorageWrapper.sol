// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { FixedRateStorageWrapper } from "../interestRates/fixedRate/FixedRateStorageWrapper.sol";

abstract contract TotalBalancesStorageWrapper is FixedRateStorageWrapper {
    function _getTotalBalance(address _tokenHolder) internal view virtual returns (uint256 totalBalance);

    function _getTotalBalanceForAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 totalBalance);

    function _getTotalBalanceForByPartitionAdjusted(
        bytes32 partition,
        address tokenHolder
    ) internal view virtual returns (uint256 totalBalance);

    function _getTotalBalanceOfAtSnapshot(
        uint256 snapshotId,
        address tokenHolder
    ) internal view virtual returns (uint256 totalBalance);

    function _getTotalBalanceOfAtSnapshotByPartition(
        bytes32 partition,
        uint256 snapshotId,
        address tokenHolder
    ) internal view virtual returns (uint256 totalBalance);
}
