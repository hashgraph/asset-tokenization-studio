// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
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
