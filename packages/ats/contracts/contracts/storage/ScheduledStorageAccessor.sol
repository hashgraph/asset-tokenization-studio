// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULED STORAGE — Centralized storage accessor for library-based diamond migration
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file provides ONLY struct definitions and free function accessors for
// scheduled tasks and interest rate storage (snapshots, balance adjustments,
// coupon listings, cross-ordered tasks, fixed rate, KPI linked rate,
// sustainability performance target rate, and KPIs).
//
// NO logic, NO inheritance, NO abstract contracts — just structs and accessors.
//
// ═══════════════════════════════════════════════════════════════════════════════

import { _SCHEDULED_SNAPSHOTS_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _SCHEDULED_COUPON_LISTING_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _FIXED_RATE_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _KPI_LINKED_RATE_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _KPIS_STORAGE_POSITION } from "../constants/storagePositions.sol";

import { LibCheckpoints } from "../infrastructure/lib/LibCheckpoints.sol";
// solhint-disable max-line-length
import {
    ISustainabilityPerformanceTargetRate
} from "../facets/assetCapabilities/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
// solhint-enable max-line-length

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE STRUCTS
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev Scheduled task entry
struct ScheduledTask {
    uint256 scheduledTimestamp;
    bytes data;
}

/// @dev Generic scheduled tasks data storage (snapshots, adjustments, listings, cross-tasks)
struct ScheduledTasksDataStorage {
    mapping(uint256 => ScheduledTask) scheduledTasks;
    uint256 scheduledTaskCount;
}

/// @dev Fixed rate interest storage
struct FixedRateDataStorage {
    uint256 rate;
    uint8 decimals;
    bool initialized;
}

/// @dev KPI-linked rate interest storage
struct KpiLinkedRateDataStorage {
    uint256 maxRate;
    uint256 baseRate;
    uint256 minRate;
    uint256 startPeriod;
    uint256 startRate;
    uint256 missedPenalty;
    uint256 reportPeriod;
    uint8 rateDecimals;
    uint256 maxDeviationCap;
    uint256 baseLine;
    uint256 maxDeviationFloor;
    uint256 adjustmentPrecision;
    uint8 impactDataDecimals;
    bool initialized;
}

/// @dev Sustainability performance target rate interest storage
struct SustainabilityPerformanceTargetRateDataStorage {
    uint256 baseRate;
    uint256 startPeriod;
    uint256 startRate;
    uint8 rateDecimals;
    mapping(address project => ISustainabilityPerformanceTargetRate.ImpactData impactData) impactDataByProject;
    bool initialized;
}

/// @dev KPIs data storage with checkpoint tracking
struct KpisDataStorage {
    mapping(address => LibCheckpoints.Checkpoint[]) checkpointsByProject;
    mapping(address => mapping(uint256 => bool)) checkpointsDatesByProject;
    uint256 minDate;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE ACCESSOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev Access scheduled snapshots storage
function scheduledSnapshotStorage() pure returns (ScheduledTasksDataStorage storage scheduledSnapshots_) {
    bytes32 pos = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        scheduledSnapshots_.slot := pos
    }
}

/// @dev Access scheduled balance adjustments storage
function scheduledBalanceAdjustmentStorage()
    pure
    returns (ScheduledTasksDataStorage storage scheduledBalanceAdjustments_)
{
    bytes32 pos = _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        scheduledBalanceAdjustments_.slot := pos
    }
}

/// @dev Access scheduled coupon listings storage
function scheduledCouponListingStorage() pure returns (ScheduledTasksDataStorage storage scheduledCouponListing_) {
    bytes32 pos = _SCHEDULED_COUPON_LISTING_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        scheduledCouponListing_.slot := pos
    }
}

/// @dev Access scheduled cross-ordered tasks storage
function scheduledCrossOrderedTaskStorage()
    pure
    returns (ScheduledTasksDataStorage storage scheduledCrossOrderedTasks_)
{
    bytes32 pos = _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        scheduledCrossOrderedTasks_.slot := pos
    }
}

/// @dev Access fixed rate interest storage
function fixedRateStorage() pure returns (FixedRateDataStorage storage fixedRate_) {
    bytes32 pos = _FIXED_RATE_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        fixedRate_.slot := pos
    }
}

/// @dev Access KPI-linked rate interest storage
function kpiLinkedRateStorage() pure returns (KpiLinkedRateDataStorage storage kpiLinkedRate_) {
    bytes32 pos = _KPI_LINKED_RATE_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        kpiLinkedRate_.slot := pos
    }
}

/// @dev Access sustainability performance target rate interest storage
function sustainabilityPerformanceTargetRateStorage()
    pure
    returns (SustainabilityPerformanceTargetRateDataStorage storage sptRate_)
{
    bytes32 pos = _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        sptRate_.slot := pos
    }
}

/// @dev Access KPIs data storage
function kpisDataStorage() pure returns (KpisDataStorage storage kpis_) {
    bytes32 pos = _KPIS_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        kpis_.slot := pos
    }
}
