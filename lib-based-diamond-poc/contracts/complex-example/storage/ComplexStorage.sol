// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLEX STORAGE — Shared storage definitions for the Green Bond example
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file defines ALL storage structs and accessors used by both the OLD
// (inheritance-based) and NEW (library-based) architectures.
//
// DOMAIN: A "Green Bond" with KPI-linked interest rates, scheduled coupon
// payments, balance adjustments (stock splits/consolidations), automated
// snapshots, and cross-ordered task coordination.
//
// ═══════════════════════════════════════════════════════════════════════════════

// ──────────────────────── Role Constants ────────────────────────────────────

bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;
bytes32 constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 constant COUPON_MANAGER_ROLE = keccak256("COUPON_MANAGER_ROLE");
bytes32 constant ADJUSTMENT_BALANCE_ROLE = keccak256("ADJUSTMENT_BALANCE_ROLE");
bytes32 constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
bytes32 constant SCHEDULER_ROLE = keccak256("SCHEDULER_ROLE");
bytes32 constant INTEREST_RATE_MANAGER_ROLE = keccak256("INTEREST_RATE_MANAGER_ROLE");

// ──────────────────────── Partition Constants ───────────────────────────────

bytes32 constant DEFAULT_PARTITION = keccak256("DEFAULT");

// ──────────────────────── Corporate Action Types ───────────────────────────

uint8 constant COUPON_ACTION_TYPE = 1;
uint8 constant ADJUSTMENT_ACTION_TYPE = 2;
uint8 constant SNAPSHOT_ACTION_TYPE = 3;

// ──────────────────────── Storage Positions ─────────────────────────────────

bytes32 constant PAUSE_STORAGE_POSITION = keccak256("complex.storage.pause");
bytes32 constant ACCESS_STORAGE_POSITION = keccak256("complex.storage.access");
bytes32 constant TOKEN_STORAGE_POSITION = keccak256("complex.storage.token");
bytes32 constant COMPLIANCE_STORAGE_POSITION = keccak256("complex.storage.compliance");
bytes32 constant ABAF_STORAGE_POSITION = keccak256("complex.storage.abaf");
bytes32 constant SNAPSHOT_STORAGE_POSITION = keccak256("complex.storage.snapshot");
bytes32 constant BOND_STORAGE_POSITION = keccak256("complex.storage.bond");
bytes32 constant SCHEDULED_TASKS_STORAGE_POSITION = keccak256("complex.storage.scheduledTasks");
bytes32 constant CORPORATE_ACTIONS_STORAGE_POSITION = keccak256("complex.storage.corporateActions");
bytes32 constant INTEREST_RATE_STORAGE_POSITION = keccak256("complex.storage.interestRate");

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE STRUCTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Pause ──────────────────────────────────────────────────────────────────

struct PauseStorage {
    bool paused;
}

// ─── Access Control ─────────────────────────────────────────────────────────

struct AccessStorage {
    mapping(bytes32 => mapping(address => bool)) roles;
    mapping(bytes32 => address[]) roleMembers;
}

// ─── ERC1410 Partitioned Token ──────────────────────────────────────────────

struct TokenStorage {
    string name;
    string symbol;
    uint8 decimals;
    uint256 totalSupply;
    // Partition-based balances (ERC1410)
    mapping(bytes32 => mapping(address => uint256)) partitionBalances;
    mapping(bytes32 => uint256) partitionTotalSupply;
    mapping(address => bytes32[]) holderPartitions;
    // Token holder tracking
    address[] tokenHolders;
    mapping(address => bool) isTokenHolder;
    mapping(address => uint256) tokenHolderIndex;
}

// ─── Compliance (KYC) ───────────────────────────────────────────────────────

struct ComplianceStorage {
    mapping(address => bool) compliant;
}

// ─── ABAF / LABAF (Balance Adjustment Factors) ─────────────────────────────
//
// ABAF  = Aggregated Balance Adjustment Factor (global, cumulative)
// LABAF = Last-seen ABAF per entity (account, partition, allowance, etc.)
//
// When a balance adjustment occurs (e.g., 2:1 stock split with factor=2e18):
//   1. ABAF is multiplied: ABAF_new = ABAF_old × factor
//   2. Individual balances are NOT updated immediately (gas-efficient)
//   3. When querying balance: adjusted = raw × (ABAF / LABAF_account)
//   4. When transferring: sync LABAF to current ABAF first
//
// This is the most complex part of the system because LABAF must be tracked
// at EVERY level: account, partition, locked, held, frozen, allowances.

struct ABAFStorage {
    // Global cumulative adjustment factor (18 decimals)
    uint256 abaf;
    uint8 abafDecimals;
    // Per-account last-seen ABAF
    mapping(address => uint256) labaf;
    // Per-account-per-partition last-seen ABAF
    mapping(address => mapping(bytes32 => uint256)) labafByPartition;
    // Per-owner-per-spender allowance LABAF
    mapping(address => mapping(address => uint256)) labafAllowances;
    // Per-account frozen amount LABAF
    mapping(address => uint256) labafFrozenByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafFrozenByPartition;
    // Per-account locked amount LABAF
    mapping(address => uint256) labafLockedByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafLockedByPartition;
    // Per-account held amount LABAF
    mapping(address => uint256) labafHeldByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafHeldByPartition;
    // History: ABAF at each adjustment timestamp
    uint256[] abafTimestamps;
    uint256[] abafValues;
}

// ─── Snapshots ──────────────────────────────────────────────────────────────

struct SnapshotEntry {
    uint256 snapshotId;
    uint256 value;
}

struct SnapshotStorage {
    uint256 currentSnapshotId;
    // Per-account balance snapshots
    mapping(address => SnapshotEntry[]) accountSnapshots;
    // Per-partition total supply snapshots
    mapping(bytes32 => SnapshotEntry[]) partitionTotalSnapshots;
    // Per-account-per-partition balance snapshots
    mapping(address => mapping(bytes32 => SnapshotEntry[])) accountPartitionSnapshots;
    // Total supply snapshots
    SnapshotEntry[] totalSupplySnapshots;
    // ABAF at each snapshot (critical for accurate historical queries)
    mapping(uint256 => uint256) abafAtSnapshot;
    // Token holders at each snapshot
    mapping(uint256 => address[]) holdersAtSnapshot;
    mapping(uint256 => mapping(address => bool)) holderExistsAtSnapshot;
}

// ─── Bond ───────────────────────────────────────────────────────────────────

enum RateCalculationStatus { PENDING, SET, EXECUTED }

struct Coupon {
    uint256 recordDate;      // Snapshot date (who holds what)
    uint256 executionDate;   // Payment date
    uint256 startDate;       // Accrual start
    uint256 endDate;         // Accrual end
    uint256 fixingDate;      // Interest rate determination date
    uint256 rate;            // Interest rate (set at fixingDate)
    uint8 rateDecimals;
    RateCalculationStatus rateStatus;
    uint256 snapshotId;      // Snapshot taken at recordDate
}

struct BondStorage {
    bytes3 currency;
    uint256 nominalValue;
    uint8 nominalValueDecimals;
    uint256 startingDate;
    uint256 maturityDate;
    // Coupons
    uint256 couponCount;
    mapping(uint256 => Coupon) coupons;
    uint256[] couponOrderedList;  // Coupon IDs ordered by record date
}

// ─── Scheduled Tasks ────────────────────────────────────────────────────────

enum ScheduledTaskType {
    BALANCE_ADJUSTMENT,
    SNAPSHOT,
    COUPON_LISTING
}

struct ScheduledTask {
    uint256 timestamp;
    ScheduledTaskType taskType;
    bytes data;   // ABI-encoded task parameters
}

struct ScheduledTasksStorage {
    ScheduledTask[] tasks;  // Sorted by timestamp ascending
    uint256 lastTriggeredIndex;
}

// ─── Corporate Actions ──────────────────────────────────────────────────────

struct CorporateAction {
    uint8 actionType;
    uint256 timestamp;
    bytes data;
    bytes result;
}

struct CorporateActionsStorage {
    uint256 actionCount;
    mapping(uint256 => CorporateAction) actions;
    mapping(bytes32 => bool) contentHashExists;
}

// ─── Interest Rate (KPI-Linked) ─────────────────────────────────────────────

struct KpiLinkedRateConfig {
    uint256 baseRate;
    uint256 minRate;
    uint256 maxRate;
    uint256 startRate;
    uint256 startPeriod;
    uint256 missedPenalty;
    uint256 reportPeriod;
    uint8 rateDecimals;
}

struct KpiImpactData {
    uint256 baseLine;
    uint256 maxDeviationFloor;
    uint256 maxDeviationCap;
    uint8 impactDataDecimals;
    uint256 adjustmentPrecision;
}

struct KpiReport {
    uint256 value;
    uint256 timestamp;
    bool exists;
}

struct InterestRateStorage {
    KpiLinkedRateConfig config;
    KpiImpactData impactData;
    // KPI reports per project
    mapping(address => KpiReport[]) kpiReports;
    address[] kpiProjects;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE ACCESSOR FUNCTIONS (free functions — used by both architectures)
// ═══════════════════════════════════════════════════════════════════════════════

function pauseStorage() pure returns (PauseStorage storage ps) {
    bytes32 pos = PAUSE_STORAGE_POSITION;
    assembly { ps.slot := pos }
}

function accessStorage() pure returns (AccessStorage storage acs) {
    bytes32 pos = ACCESS_STORAGE_POSITION;
    assembly { acs.slot := pos }
}

function tokenStorage() pure returns (TokenStorage storage ts) {
    bytes32 pos = TOKEN_STORAGE_POSITION;
    assembly { ts.slot := pos }
}

function complianceStorage() pure returns (ComplianceStorage storage cs) {
    bytes32 pos = COMPLIANCE_STORAGE_POSITION;
    assembly { cs.slot := pos }
}

function abafStorage() pure returns (ABAFStorage storage abs_) {
    bytes32 pos = ABAF_STORAGE_POSITION;
    assembly { abs_.slot := pos }
}

function snapshotStorage() pure returns (SnapshotStorage storage ss) {
    bytes32 pos = SNAPSHOT_STORAGE_POSITION;
    assembly { ss.slot := pos }
}

function bondStorage() pure returns (BondStorage storage bs) {
    bytes32 pos = BOND_STORAGE_POSITION;
    assembly { bs.slot := pos }
}

function scheduledTasksStorage() pure returns (ScheduledTasksStorage storage sts) {
    bytes32 pos = SCHEDULED_TASKS_STORAGE_POSITION;
    assembly { sts.slot := pos }
}

function corporateActionsStorage() pure returns (CorporateActionsStorage storage cas) {
    bytes32 pos = CORPORATE_ACTIONS_STORAGE_POSITION;
    assembly { cas.slot := pos }
}

function interestRateStorage() pure returns (InterestRateStorage storage irs) {
    bytes32 pos = INTEREST_RATE_STORAGE_POSITION;
    assembly { irs.slot := pos }
}
