// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

/**
 * @dev Shared values used across multiple facets for consistency.
 * Utility constants for type hashes, partitions, and corporate actions.
 */
uint256 constant MAX_UINT256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
address constant ZERO_ADDRESS = address(0);
bytes32 constant EMPTY_BYTES32 = bytes32(0);
bytes constant EMPTY_BYTES = bytes("");

// Default partition identifier (bytes32(1))
// Used as the default partition for ERC1410 token operations when no specific partition is specified
bytes32 constant _DEFAULT_PARTITION = 0x0000000000000000000000000000000000000000000000000000000000000001;
uint256 constant SNAPSHOT_RESULT_ID = 0;
uint256 constant COUPON_LISTING_RESULT_ID = 1;

// keccak256('security.token.standard.dividend.corporateAction');
bytes32 constant DIVIDEND_CORPORATE_ACTION_TYPE = 0x1c29d09f87f2b0c8192a7719a2acdfdfa320dc2835b5a0398e5bd8dc34c14b0e;

// keccak256('security.token.standard.votingRights.corporateAction');
bytes32 constant VOTING_RIGHTS_CORPORATE_ACTION_TYPE = 0x250dbe25ab2f06b39b936572a67e1dbfce91fb156f522809fe817f89bf684047;

// keccak256('security.token.standard.coupon.corporateAction');
bytes32 constant COUPON_CORPORATE_ACTION_TYPE = 0x4657b10f3cac57d39d628d52e74738d0fdcadc1b2f82958cb835081f1bb26620;

// keccak256('security.token.standard.balanceAdjustment.corporateAction');
bytes32 constant BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE = 0x1256aa1b36483ca651f5d8cbafb7033dcb54872ae7d24442b8ee4baa3f49aa2f;

// keccak256('security.token.standard.amortization.corporateActionType');
bytes32 constant AMORTIZATION_CORPORATE_ACTION_TYPE = 0xd50dd756b70910558bc278c0ccbd8c01d444a4178c07a5baf8e2578c8ec6034b;

// keccak256('security.token.standard.loan.corporateActionType');
bytes32 constant LOAN_CORPORATE_ACTION_TYPE = 0x8f3e2a1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f;

// keccak256('security.token.standard.balanceAdjustment.scheduledTasks');
bytes32 constant BALANCE_ADJUSTMENT_TASK_TYPE = 0x9ce9cffaccaf68fc544ce4df9e5e2774249df2f0b3c9cf940a53a6827465db9d;

// keccak256('security.token.standard.snapshot.scheduledTasks');
bytes32 constant SNAPSHOT_TASK_TYPE = 0x322c4b500b27950e00c27e3a40ca8f9ffacbc81a3b4e3c9516717391fd54234c;

// keccak256('security.token.standard.couponListing.scheduledTasks');
bytes32 constant COUPON_LISTING_TASK_TYPE = 0xc0025ea024305bcaedb7e0a5d9ef6f0bca23bb36ee261794fdfb21cd810563ce;

bytes32 constant ERC20PERMIT_TYPEHASH = keccak256(
    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
);

bytes32 constant _DELEGATION_ERC20VOTES_TYPEHASH = keccak256(
    "Delegation(address delegatee,uint256 nonce,uint256 expiry)"
);

bytes1 constant _IS_PAUSED_ERROR_ID = 0x40;
bytes1 constant _OPERATOR_ACCOUNT_BLOCKED_ERROR_ID = 0x41;
bytes1 constant _FROM_ACCOUNT_BLOCKED_ERROR_ID = 0x42;
bytes1 constant _TO_ACCOUNT_BLOCKED_ERROR_ID = 0x43;
bytes1 constant _FROM_ACCOUNT_NULL_ERROR_ID = 0x44;
bytes1 constant _TO_ACCOUNT_NULL_ERROR_ID = 0x45;
bytes1 constant _NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID = 0x46;
bytes1 constant _IS_NOT_OPERATOR_ERROR_ID = 0x47;
bytes1 constant _WRONG_PARTITION_ERROR_ID = 0x48;
bytes1 constant _ALLOWANCE_REACHED_ERROR_ID = 0x49;
bytes1 constant _FROM_ACCOUNT_KYC_ERROR_ID = 0x50;
bytes1 constant _TO_ACCOUNT_KYC_ERROR_ID = 0x51;
bytes1 constant _CLEARING_ACTIVE_ERROR_ID = 0x52;
bytes1 constant _ADDRESS_RECOVERED_OPERATOR_ERROR_ID = 0x53;
bytes1 constant _ADDRESS_RECOVERED_FROM_ERROR_ID = 0x54;
bytes1 constant _ADDRESS_RECOVERED_TO_ERROR_ID = 0x55;

bytes1 constant _SUCCESS = 0x00;

// solhint-disable max-line-length
//keccak256(
//    'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
//);
bytes32 constant _DOMAIN_TYPE_HASH = 0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f;
string constant _SALT = "\x19\x01";

uint256 constant _ISIN_LENGTH = 12;
uint256 constant _CHECKSUM_POSITION_IN_ISIN = 11;
uint8 constant _TEN = 10;
uint8 constant _UINT_WITH_ONE_DIGIT = 9;
uint8 constant _ASCII_9 = 57;
uint8 constant _ASCII_7 = 55;
uint8 constant _ASCII_0 = 48;

// solhint-disable-next-line max-line-length
//keccak256('protectedTransferFromByPartition(bytes32 _partition,address _from,address _to,uint256 _amount,uint256 _deadline,uint256 _nonce)');
// solhint-disable-next-line max-line-length
bytes32 constant _PROTECTED_TRANSFER_FROM_PARTITION_TYPEHASH = 0x16deec2d76392b2642d942266ed8c94deb86eeb6635eddeb0c875b884306328a;

// solhint-disable-next-line max-line-length
//keccak256('protectedRedeemFromByPartition(bytes32 _partition,address _from,uint256 _amount,uint256 _deadline,uint256 _nonce)');
// solhint-disable-next-line max-line-length
bytes32 constant _PROTECTED_REDEEM_FROM_PARTITION_TYPEHASH = 0xbc3531b1719123937a7188397ff70a66a55675a651e932b581bdcbd9e2f780dc;

// solhint-disable-next-line max-line-length
//keccak256('protectedCreateHoldByPartition(bytes32 _partition,address _from,ProtectedHold _protectedHold)Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)ProtectedHold(Hold hold,uint256 deadline,uint256 nonce)');
// solhint-disable-next-line max-line-length
bytes32 constant _PROTECTED_CREATE_HOLD_FROM_PARTITION_TYPEHASH = 0xfd0d74766e5201a669a9197ba674709a23bc9c94c38a9ed40649836def3747eb;

// solhint-disable-next-line max-line-length
//keccak256('protectedClearingCreateHoldByPartition(ProtectedClearingOperation _protectedClearingOperation,Hold _hold)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)');
// solhint-disable-next-line max-line-length
bytes32 constant _PROTECTED_CLEARING_CREATE_HOLD_FROM_PARTITION_TYPEHASH = 0x785e8513e34a44521b76d095722cbc8f41f6073a2f949a9dc79f85da36188f08;

//keccak256(
//'Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)'
//);
bytes32 constant _HOLD_TYPEHASH = 0x638791043a42aa7472ccb18a7ede86b9baf01fb2d2128a743cf5dc473057d7bc;

// solhint-disable-next-line max-line-length
//keccak256('ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)');
// solhint-disable-next-line max-line-length
bytes32 constant _PROTECTED_CLEARING_OPERATION_TYPEHASH = 0x1e3a71820115912522e83d52ecad9fb4b7753a55d2d3d24c1c4e3047f9eb2e1f;

//keccak256(
//'ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)'
//);
bytes32 constant _CLEARING_OPERATION_TYPEHASH = 0x6b1a3eed3300b58d08c0db9042a291c5c816c5891e585aad19ad1b2723d147bc;

// solhint-disable-next-line max-line-length
//keccak256('ProtectedHold(Hold hold,uint256 deadline,uint256 nonce)Hold(uint256 amount,uint256 expirationTimestamp,address escrow,address to,bytes data)');
bytes32 constant _PROTECTED_HOLD_TYPEHASH = 0x432ede4c9f6d06cc57be0d75da5dce179cd5f56db988520d5b77795a69b0dc2e;

// solhint-disable-next-line max-line-length
//keccak256('protectedClearingTransferByPartition(ProtectedClearingOperation _protectedClearingOperation,uint256 _amount,address _to)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)');
// solhint-disable-next-line max-line-length
bytes32 constant _PROTECTED_CLEARING_TRANSFER_PARTITION_TYPEHASH = 0x9ac8bf58d69dcdeba1416569ae4a5e8aef8b8bd1517e584211c6f3b149ef7989;

// solhint-disable-next-line max-line-length
//keccak256('protectedClearingRedeemByPartition(ProtectedClearingOperation _protectedClearingOperation,uint256 _amount)ClearingOperation(bytes32 partition,uint256 expirationTimestamp,bytes data)ProtectedClearingOperation(ClearingOperation clearingOperation,address from,uint256 deadline,uint256 nonce)');
// solhint-disable-next-line max-line-length
bytes32 constant _PROTECTED_CLEARING_REDEEM_TYPEHASH = 0x9800252304972e5a6e126479147b31373237346ee6c2c4cdbfd4ee18a138477e;

// ============================================================================
// UnexpectedError IDs - Defensive programming constants for impossible states
// ============================================================================

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

/// @dev ID for EquityStorageWrapper.getDividend()
bytes4 constant KPI_EQUITY_DIVIDEND_DATA = 0x00000006;

/// @dev ID for EquityStorageWrapper.getVoting()
bytes4 constant KPI_EQUITY_VOTING_DATA = 0x00000007;

/// @dev ID for EquityStorageWrapper.getScheduledBalanceAdjustment()
bytes4 constant KPI_EQUITY_BALANCE_ADJ = 0x00000008;

/// @dev ID for Bond.redeemAtMaturity()
bytes4 constant KPI_BOND_REDEEM_BALANCE = 0x00000009;

/// @dev ID for KpiLinkedRateLib._getPreviousCouponRate()
bytes4 constant KPI_LINKED_RATE_COUPON = 0x0000000A;

uint256 constant MAX_INITIALIZER_FACET_INDEX = 10;
