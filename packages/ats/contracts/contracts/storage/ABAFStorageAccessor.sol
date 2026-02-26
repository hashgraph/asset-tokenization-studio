// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ADJUST_BALANCES_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _SNAPSHOT_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _CORPORATE_ACTION_STORAGE_POSITION } from "../constants/storagePositions.sol";

import { CountersUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import { IClearing } from "../facets/features/interfaces/clearing/IClearing.sol";
import { CorporateActionDataStorage } from "../facets/features/interfaces/ICorporateActions.sol";
import { Snapshots, SnapshotsAddress, PartitionSnapshots } from "../facets/features/interfaces/ISnapshots.sol";

/// @dev Adjust Balances storage
struct AdjustBalancesStorage {
    mapping(address => uint256[]) labafUserPartition;
    uint256 abaf;
    mapping(address => uint256) labaf;
    mapping(bytes32 => uint256) labafByPartition;
    mapping(address => mapping(address => uint256)) labafsAllowances;
    mapping(address => uint256) labafLockedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafLockedAmountByAccountAndPartition;
    // solhint-disable-next-line max-line-length
    mapping(address => mapping(bytes32 => mapping(uint256 => uint256))) labafLockedAmountByAccountPartitionAndId;
    mapping(address => uint256) labafHeldAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafHeldAmountByAccountAndPartition;
    // solhint-disable-next-line max-line-length
    mapping(address => mapping(bytes32 => mapping(uint256 => uint256))) labafHeldAmountByAccountPartitionAndId;
    mapping(address => uint256) labafClearedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafClearedAmountByAccountAndPartition;
    // solhint-disable-next-line max-line-length
    mapping(address => mapping(bytes32 => mapping(IClearing.ClearingOperationType => mapping(uint256 => uint256)))) labafClearedAmountByAccountPartitionTypeAndId;
    mapping(address => uint256) labafFrozenAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafFrozenAmountByAccountAndPartition;
}

/// @dev Snapshot storage
struct SnapshotStorage {
    mapping(address => Snapshots) accountBalanceSnapshots;
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionBalanceSnapshots;
    mapping(address => PartitionSnapshots) accountPartitionMetadata;
    Snapshots totalSupplySnapshots;
    CountersUpgradeable.Counter currentSnapshotId;
    mapping(address => Snapshots) accountLockedBalanceSnapshots;
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionLockedBalanceSnapshots;
    mapping(bytes32 => Snapshots) totalSupplyByPartitionSnapshots;
    mapping(address => Snapshots) accountHeldBalanceSnapshots;
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionHeldBalanceSnapshots;
    mapping(address => Snapshots) accountClearedBalanceSnapshots;
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionClearedBalanceSnapshots;
    Snapshots abafSnapshots;
    Snapshots decimals;
    mapping(address => Snapshots) accountFrozenBalanceSnapshots;
    mapping(address => mapping(bytes32 => Snapshots)) accountPartitionFrozenBalanceSnapshots;
    mapping(uint256 => SnapshotsAddress) tokenHoldersSnapshots;
    Snapshots totalTokenHoldersSnapshots;
}

/// @dev Access adjust balances storage
function adjustBalancesStorage() pure returns (AdjustBalancesStorage storage adjustBalances_) {
    bytes32 pos = _ADJUST_BALANCES_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        adjustBalances_.slot := pos
    }
}

/// @dev Access snapshot storage
function snapshotStorage() pure returns (SnapshotStorage storage snapshot_) {
    bytes32 pos = _SNAPSHOT_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        snapshot_.slot := pos
    }
}

/// @dev Access corporate actions storage
function corporateActionsStorage() pure returns (CorporateActionDataStorage storage corporateActions_) {
    bytes32 pos = _CORPORATE_ACTION_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        corporateActions_.slot := pos
    }
}
