// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProceedRecipientsInternals } from "../proceedRecipients/ProceedRecipientsInternals.sol";
import { Snapshots, PartitionSnapshots } from "../../layer_1/interfaces/snapshots/ISnapshots.sol";

abstract contract AdjustBalancesInternals is ProceedRecipientsInternals {
    function _adjustBalances(uint256 _factor, uint8 _decimals) internal virtual;
    function _adjustDecimals(uint8 decimals) internal virtual;
    function _adjustTotalBalanceAndPartitionBalanceFor(bytes32 partition, address account) internal virtual;
    function _adjustTotalSupply(uint256 factor) internal virtual;
    function _adjustTotalSupplyByPartition(bytes32 _partition, uint256 _factor) internal virtual;
    function _pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal virtual;
    function _syncBalanceAdjustments(bytes32 _partition, address _from, address _to) internal virtual;
    function _takeAbafCheckpoint() internal virtual;
    function _triggerAndSyncAll(bytes32 _partition, address _from, address _to) internal virtual;
    function _updateAbaf(uint256 factor) internal virtual;
    function _updateAbafSnapshot() internal virtual;
    function _updateAccountSnapshot(
        Snapshots storage balanceSnapshots,
        uint256 currentValue,
        Snapshots storage partitionBalanceSnapshots,
        PartitionSnapshots storage partitionSnapshots,
        uint256 currentValueForPartition,
        bytes32[] memory partitionIds
    ) internal virtual;
    function _updateAccountSnapshot(address account, bytes32 partition) internal virtual;
    function _updateAllowanceAndLabaf(address _owner, address _spender) internal virtual;
    function _updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal virtual;
    function _updateAssetTotalSupplySnapshot() internal virtual;
    function _updateDecimalsSnapshot() internal virtual;
    function _updateLabafByPartition(bytes32 partition) internal virtual;
    function _updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal virtual;
    function _updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal virtual;
    function _allowanceAdjustedAt(
        address _owner,
        address _spender,
        uint256 _timestamp
    ) internal view virtual returns (uint256);
    function _balanceOf(address _tokenHolder) internal view virtual returns (uint256);
    function _balanceOfAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view virtual returns (uint256);
    function _balanceOfByPartition(bytes32 _partition, address _tokenHolder) internal view virtual returns (uint256);
    function _balanceOfByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256);
    function _calculateFactorBetween(uint256 _fromBlock, uint256 _toBlock) internal view virtual returns (uint256);
    function _calculateFactorByAbafAndTokenHolder(
        uint256 abaf,
        address tokenHolder
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorByTokenHolderAndPartitionIndex(
        uint256 abaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorForClearedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorForHeldAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 factor);
    function _calculateFactorForLockedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 factor);
    function _decimalsAdjustedAt(uint256 _timestamp) internal view virtual returns (uint8);
    function _getAbaf() internal view virtual returns (uint256);
    function _getAbafAdjustedAt(uint256 _timestamp) internal view virtual returns (uint256);
    function _getAllowanceLabaf(address _owner, address _spender) internal view virtual returns (uint256);
    function _getLabafByPartition(bytes32 _partition) internal view virtual returns (uint256);
    function _getLabafByUser(address _account) internal view virtual returns (uint256);
    function _getLabafByUserAndPartition(bytes32 _partition, address _account) internal view virtual returns (uint256);
    function _getLabafByUserAndPartitionIndex(
        uint256 _partitionIndex,
        address _account
    ) internal view virtual returns (uint256);
    function _getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view virtual returns (uint256 pendingABAF_, uint8 pendingDecimals_);
    function _totalSupply() internal view virtual returns (uint256);
    function _totalSupplyAdjustedAt(uint256 _timestamp) internal view virtual returns (uint256);
    function _totalSupplyByPartition(bytes32 _partition) internal view virtual returns (uint256);
    function _totalSupplyByPartitionAdjustedAt(
        bytes32 _partition,
        uint256 _timestamp
    ) internal view virtual returns (uint256);
    function _add(uint256 a, uint256 b) internal pure virtual returns (uint256);
    function _calculateFactor(uint256 _abaf, uint256 _labaf) internal pure virtual returns (uint256 factor_);
    function _subtract(uint256 a, uint256 b) internal pure virtual returns (uint256);
    function _zeroToOne(uint256 _input) internal pure virtual returns (uint256);
}
