// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/*
 * Shared primitive values used across facets.
 *
 * Hash-derived constants live in their dedicated files:
 *   - roles.sol           role identifiers
 *   - eip712.sol          EIP-712 type hashes + domain salt
 *   - dispatchTypes.sol   corporate-action + scheduled-task type ids
 *
 * This file is reserved for non-hash primitives: numeric limits, default
 * partition, error IDs, ASCII helpers, KPI dispatch IDs.
 */

uint256 constant MAX_UINT256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
uint8 constant MAX_UINT8 = 0xff;

/// @dev Maximum number of entries permitted in any external list (external pauses, control lists
///      and KYC lists). Each external list is iterated in full on the hot path of every
///      `onlyUnpaused` or compliance-gated operation, so an unbounded list could push the
///      iteration past the block/transaction gas limit and permanently brick the token. The cap
///      bounds that worst-case gas while comfortably exceeding any realistic number of providers.
uint256 constant MAX_EXTERNAL_LIST_SIZE = 10;
address constant ZERO_ADDRESS = address(0);
bytes32 constant EMPTY_BYTES32 = bytes32(0);
bytes constant EMPTY_BYTES = bytes("");

// Default partition identifier (bytes32(1))
// Used as the default partition for ERC1410 token operations when no specific partition is specified
bytes32 constant DEFAULT_PARTITION = 0x0000000000000000000000000000000000000000000000000000000000000001;
uint256 constant SNAPSHOT_RESULT_ID = 0;
uint256 constant COUPON_LISTING_RESULT_ID = 1;

/// @dev ID for CorporateActionsStorageWrapper.addCorporateAction()
bytes4 constant KPI_CA_ADD_ACTION = 0x00000001;

/// @dev ID for ERC20StorageWrapper.approve()
bytes4 constant KPI_ERC20_APPROVE_OWNER = 0x00000002;

/// @dev ID for KpisStorageWrapper.addToCouponsOrderedList()
bytes4 constant KPI_KPIS_ADD_COUPON_DATE = 0x00000003;

/// @dev ID for KpisStorageWrapper.setMinDate()
bytes4 constant KPI_KPIS_SET_MINDATE = 0x00000004;

/// @dev ID for ERC20VotesStorageWrapper.calculateFactorBetween()
bytes4 constant KPI_VOTES_CALC_FACTOR = 0x00000005;

/// @dev ID for ScheduledBalanceAdjustmentBase.getScheduledBalanceAdjustment()
bytes4 constant BALANCE_ADJ_DATA = 0x00000008;

/// @dev ID for KpiLinkedRateLib._getPreviousCouponRate()
bytes4 constant KPI_LINKED_RATE_COUPON = 0x0000000A;

/// @dev ID for ClearingOps.clearingHoldCreationExecution()
bytes4 constant CLEARING_HOLD_CREATION = 0x0000000B;

/// @dev ID for ERC1410StorageWrapper.removeTokenHolder()
bytes4 constant KPI_ERC1410_REMOVE_HOLDER = 0x0000000C;

/// @dev ID for the defensive operational-status guard in Factory deploy functions.
bytes4 constant FACTORY_OPERATIONAL_STATUS = 0x0000000D;

/// @dev ID for CouponRateDispatch.unrecognizedRateType()
bytes4 constant UNRECOGNIZED_RATE_TYPE = 0x0000000E;

/// @dev Precomputed constants for powers of 10 (0-18)
uint256 constant POW10_0 = 1;
uint256 constant POW10_1 = 10;
uint256 constant POW10_2 = 100;
uint256 constant POW10_3 = 1000;
uint256 constant POW10_4 = 10000;
uint256 constant POW10_5 = 100000;
uint256 constant POW10_6 = 1000000;
uint256 constant POW10_7 = 10000000;
uint256 constant POW10_8 = 100000000;
uint256 constant POW10_9 = 1000000000;
uint256 constant POW10_10 = 1e10;
uint256 constant POW10_11 = 1e11;
uint256 constant POW10_12 = 1e12;
uint256 constant POW10_13 = 1e13;
uint256 constant POW10_14 = 1e14;
uint256 constant POW10_15 = 1e15;
uint256 constant POW10_16 = 1e16;
uint256 constant POW10_17 = 1e17;
uint256 constant POW10_18 = 1e18;
