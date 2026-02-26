// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _LOCK_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _HOLD_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _CLEARING_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _CAP_STORAGE_POSITION } from "../constants/storagePositions.sol";

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import { IClearing } from "../facets/features/interfaces/clearing/IClearing.sol";
import { IClearingTransfer } from "../facets/features/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../facets/features/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../facets/features/interfaces/clearing/IClearingHoldCreation.sol";
import { ILock } from "../facets/features/interfaces/ILock.sol";
import { IHoldBase } from "../facets/features/interfaces/hold/IHoldBase.sol";

/// @dev Lock data storage
struct LockDataStorage {
    mapping(address => uint256) totalLockedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) totalLockedAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => ILock.LockData))) locksByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) lockIdsByAccountAndPartition;
    mapping(address => mapping(bytes32 => uint256)) nextLockIdByAccountAndPartition;
}

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

/// @dev Hold data storage
struct HoldDataStorage {
    mapping(address => uint256) totalHeldAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) totalHeldAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => IHoldBase.HoldData))) holdsByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) holdIdsByAccountAndPartition;
    mapping(address => mapping(bytes32 => uint256)) nextHoldIdByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => address))) holdThirdPartyByAccountPartitionAndId;
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
