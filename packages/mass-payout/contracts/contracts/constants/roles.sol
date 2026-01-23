// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

// solhint-disable max-line-length

bytes32 constant _DEFAULT_ADMIN_ROLE = 0x00;

// keccak256('lifecycle.cash.flow.role.pauser');
bytes32 constant _PAUSER_ROLE = 0x8943226357c41253cf6ffc651e04f2a3a7cf1255138972ce150e207c0393cbce;

// keccak256('lifecycle.cash.flow.role.payout');
bytes32 constant _PAYOUT_ROLE = 0x88ad01da1e5558735d5b478c04a0f1667377fb68a98cb0278159d0b790f08c10;

// keccak256('lifecycle.cash.flow.role.cashout');
bytes32 constant _CASHOUT_ROLE = 0xe0d6eef1076057afbcdc5a0534cf7ab9071fa4fdd3750e202da3d49c8913a144;

// keccak256('lifecycle.cash.flow.role.transferer');
bytes32 constant _TRANSFERER_ROLE = 0x4a16419d45be80f6de7609caac23eb8c7bfe6336a71da3cefd43ea62183ad211;

// keccak256('lifecycle.cash.flow.role.payment.token.maintainer');
bytes32 constant _PAYMENT_TOKEN_MANAGER_ROLE = 0x15e92345f55818ea6e01143954b5841c1ba74302c2b157a2b4d0f21f9ad40286;
