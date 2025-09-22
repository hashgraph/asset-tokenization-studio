// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

uint256 constant MAX_UINT256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

uint256 constant SNAPSHOT_RESULT_ID = 0;

// solhint-disable max-line-length
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
