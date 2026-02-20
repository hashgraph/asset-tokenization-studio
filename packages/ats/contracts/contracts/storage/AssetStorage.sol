// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// ═══════════════════════════════════════════════════════════════════════════════
// ASSET STORAGE — Centralized storage accessor for library-based diamond migration
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file provides ONLY struct definitions and free function accessors for
// asset-specific storage (Bond, Equity, AdjustBalances, Snapshot, CorporateActions,
// Lock, Hold, Clearing, Cap, and Security).
//
// NO logic, NO inheritance, NO abstract contracts — just structs and accessors.
//
// ═══════════════════════════════════════════════════════════════════════════════

import { _BOND_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _EQUITY_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ADJUST_BALANCES_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _SNAPSHOT_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _CORPORATE_ACTION_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _LOCK_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _HOLD_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _CLEARING_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _CAP_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _SECURITY_STORAGE_POSITION } from "../constants/storagePositions.sol";

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { CountersUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import { IClearing } from "../facets/features/interfaces/clearing/IClearing.sol";
import { IClearingTransfer } from "../facets/features/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../facets/features/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../facets/features/interfaces/clearing/IClearingHoldCreation.sol";
import { ILock } from "../facets/features/interfaces/ILock.sol";
import { HoldDataStorage } from "../facets/features/interfaces/hold/IHold.sol";
import { CorporateActionDataStorage } from "../facets/features/interfaces/ICorporateActions.sol";
import { Snapshots, SnapshotsAddress, PartitionSnapshots } from "../facets/features/interfaces/ISnapshots.sol";
import { ISecurity } from "../facets/regulation/interfaces/ISecurity.sol";

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE STRUCTS
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev Bond data storage
struct BondDataStorage {
    bytes3 currency;
    uint256 nominalValue;
    uint256 startingDate;
    uint256 maturityDate;
    bool initialized;
    uint8 nominalValueDecimals;
    uint256[] couponsOrderedListByIds;
}

/// @dev Equity data storage
struct EquityDataStorage {
    bool votingRight;
    bool informationRight;
    bool liquidationRight;
    bool subscriptionRight;
    bool conversionRight;
    bool redemptionRight;
    bool putRight;
    // Note: DividendType from IEquity, using bytes for generic storage
    uint8 dividendRight;
    bytes3 currency;
    uint256 nominalValue;
    bool initialized;
    uint8 nominalValueDecimals;
}

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

/// @dev Corporate Actions storage (re-exported from interface for consistency)
// struct CorporateActionDataStorage is already defined in ICorporateActionsStorageWrapper

/// @dev Lock data storage
struct LockDataStorage {
    mapping(address => uint256) totalLockedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) totalLockedAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => ILock.LockData))) locksByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) lockIdsByAccountAndPartition;
    mapping(address => mapping(bytes32 => uint256)) nextLockIdByAccountAndPartition;
}

/// @dev Hold data storage (re-exported from interface for consistency)
// struct HoldDataStorage is already defined in IHold interface

// solhint-disable max-line-length
/// @dev Clearing data storage
struct ClearingDataStorage {
    bool initialized;
    bool activated;
    mapping(address => uint256) totalClearedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) totalClearedAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(IClearing.ClearingOperationType => EnumerableSet.UintSet))) clearingIdsByAccountAndPartitionAndTypes;
    mapping(address => mapping(bytes32 => mapping(IClearing.ClearingOperationType => uint256))) nextClearingIdByAccountPartitionAndType;
    mapping(address => mapping(bytes32 => mapping(uint256 => IClearingTransfer.ClearingTransferData))) clearingTransferByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => mapping(uint256 => IClearingRedeem.ClearingRedeemData))) clearingRedeemByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => mapping(uint256 => IClearingHoldCreation.ClearingHoldCreationData))) clearingHoldCreationByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => mapping(IClearing.ClearingOperationType => mapping(uint256 => address)))) clearingThirdPartyByAccountPartitionTypeAndId;
}
// solhint-enable max-line-length

/// @dev Cap data storage
struct CapDataStorage {
    uint256 maxSupply;
    mapping(bytes32 => uint256) maxSupplyByPartition;
    bool initialized;
}

/// @dev Security data storage (re-exported from interface for consistency)
// struct SecurityRegulationData is already defined in ISecurity interface

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE ACCESSOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev Access bond storage
function bondStorage() pure returns (BondDataStorage storage bond_) {
    bytes32 pos = _BOND_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        bond_.slot := pos
    }
}

/// @dev Access equity storage
function equityStorage() pure returns (EquityDataStorage storage equity_) {
    bytes32 pos = _EQUITY_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        equity_.slot := pos
    }
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

/// @dev Access lock storage
function lockStorage() pure returns (LockDataStorage storage lock_) {
    bytes32 pos = _LOCK_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        lock_.slot := pos
    }
}

/// @dev Access hold storage
function holdStorage() pure returns (HoldDataStorage storage hold_) {
    bytes32 pos = _HOLD_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        hold_.slot := pos
    }
}

/// @dev Access clearing storage
function clearingStorage() pure returns (ClearingDataStorage storage clearing_) {
    bytes32 pos = _CLEARING_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        clearing_.slot := pos
    }
}

/// @dev Access cap storage
function capStorage() pure returns (CapDataStorage storage cap_) {
    bytes32 pos = _CAP_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        cap_.slot := pos
    }
}

/// @dev Access security storage
function securityStorage() pure returns (ISecurity.SecurityRegulationData storage security_) {
    bytes32 pos = _SECURITY_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        security_.slot := pos
    }
}
