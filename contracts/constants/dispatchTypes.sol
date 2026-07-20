// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/*
 * Dispatch type identifiers for corporate actions and scheduled tasks.
 *
 * Naming convention:
 *   Identifier  CORPORATE_ACTION_TYPE_<UPPER_SNAKE_NAME>
 *               SCHEDULED_TASK_TYPE_<UPPER_SNAKE_NAME>
 *   Keccak in   asset.tokenization.standard.corporateAction.<PascalName>
 *               asset.tokenization.standard.scheduledTask.<PascalName>
 *
 * Hex values are populated by `npm run generate:hashes` from the
 * `/// @custom:hash corporateAction <PascalName>` and
 * `/// @custom:hash scheduledTask <PascalName>` annotations. Do not hand-edit.
 */

// solhint-disable max-line-length

/// @custom:hash corporateAction Dividend
bytes32 constant CORPORATE_ACTION_TYPE_DIVIDEND = 0xcda4824099c82153d6d7a867a03a161c74e149619527030b479c1b7e514278a9;

/// @custom:hash corporateAction VotingRights
bytes32 constant CORPORATE_ACTION_TYPE_VOTING_RIGHTS = 0x787ddf11441ebe3ec1b98b8ca6e90e0f57ca104b503390a2e9447d1159bd91cc;

/// @custom:hash corporateAction Coupon
bytes32 constant CORPORATE_ACTION_TYPE_COUPON = 0xae67d7582594777a585a79e27de1013a58153dbb84385c8a051ef69184e25b73;

/// @custom:hash corporateAction BalanceAdjustment
bytes32 constant CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT = 0x4fa76cc94b65d4000f2c14f021f6bf4e231ae9cbd0e9a9b140a121ddf5ce5606;

/// @custom:hash corporateAction Amortization
bytes32 constant CORPORATE_ACTION_TYPE_AMORTIZATION = 0xbd6021ca59b73e43e3da7690f6dc2e7d5b7a24007a3e65e145b37bb3aaf442a8;

/// @custom:hash corporateAction Loan
bytes32 constant CORPORATE_ACTION_TYPE_LOAN = 0x63662dbf36ac82e81145fd617ad48d666f2f58c08e352a9ab22a82603a34ef24;

/// @custom:hash scheduledTask BalanceAdjustment
bytes32 constant SCHEDULED_TASK_TYPE_BALANCE_ADJUSTMENT = 0x999e2a7b5771bd471afc74da5b2094116762bb9a2f7b023ed1396b2db1e4505a;

/// @custom:hash scheduledTask Snapshot
bytes32 constant SCHEDULED_TASK_TYPE_SNAPSHOT = 0x5c2cacde8c00e9783d1a7240812af6e30345ef99c91dc19a8d17d73ac1eb7edd;

/// @custom:hash scheduledTask CouponListing
bytes32 constant SCHEDULED_TASK_TYPE_COUPON_LISTING = 0xc058879f41e7686a6d6010c3d063f2914a8b867f82ced0451e8c19493e818bc8;
