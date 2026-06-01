// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/constants/roles.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

/*
 * Role identifiers for access control across every facet.
 *
 * Naming convention:
 *   Identifier  ROLE_<UPPER_SNAKE_NAME>
 *   Keccak in   asset.tokenization.standard.role.<PascalName>
 *
 * Hex values are populated by `npm run generate:hashes` from the
 * `/// @custom:hash role <PascalName>` annotation above each constant. Do not
 * hand-edit the hex.
 *
 * Exception: `DEFAULT_ADMIN_ROLE = 0x00` keeps its OpenZeppelin-compatible
 * shape — that name is part of the OZ public API and cannot be renamed.
 *
 * CANONICAL SOURCE — a pragma-rewritten copy is auto-generated to
 * contracts/factory/ERC3643/interfaces/roles.sol on every compile by the
 * `erc3643-clone-interfaces` task. Do NOT edit the generated copy.
 */

bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

/// @custom:hash role AdjustmentBalance
bytes32 constant ROLE_ADJUSTMENT_BALANCE = 0xb246506a8ded65dd6360e8ce033fd9462936d1be64fb9f85c5f60d28cd3ca6da;

/// @custom:hash role Agent
bytes32 constant ROLE_AGENT = 0x9830aa071a741c08855dd42130bdb0ff50f7bdf5a4b72f12181eefded0c6542b;

/// @custom:hash role Amortization
bytes32 constant ROLE_AMORTIZATION = 0x0c8c9cf3db23765397bf525e10c9158fd2a7b58b280d5da82a642247779ae3c1;

/// @custom:hash role BondManager
bytes32 constant ROLE_BOND_MANAGER = 0x68fe577385095e80beadf873ac12a3100f9a9d1b6d40f0d123eecf3d01bf5c49;

/// @custom:hash role Cap
bytes32 constant ROLE_CAP = 0x58d502b7184e1a264e0cacf1a19a6c268356c6d9fda5ad83ab3b599cd3b7f41c;

/// @custom:hash role Clearing
bytes32 constant ROLE_CLEARING = 0xd0fe259e861ec493f60fb83851f1a173155b0f2acc3da153de2a23fb0ad26db6;

/// @custom:hash role ClearingValidator
bytes32 constant ROLE_CLEARING_VALIDATOR = 0xa24ef577c383d98a9326f932c69c76129dd89a71abcb626993d9f047f4e74abb;

/// @custom:hash role Controller
bytes32 constant ROLE_CONTROLLER = 0xb4d2b850c3ed8a234d390d5c157bbb1824883213c335ffe2a0f0761bb168713e;

/// @custom:hash role ControlList
bytes32 constant ROLE_CONTROL_LIST = 0x6ed9a91e996c6475ecdc28ecbdbe9bd1122fc62b30cdbe6da8271884b51ec74d;

/// @custom:hash role ControlListManager
bytes32 constant ROLE_CONTROL_LIST_MANAGER = 0xccf29bda8369877bcc921e38f30df86156a571ca5c5b8e777bf7ff75270313ea;

/// @custom:hash role CorporateAction
bytes32 constant ROLE_CORPORATE_ACTION = 0xa1acfc499025c99f55059195e6276f639d34a18aad7b8121b9192b7f438c55cd;

/// @custom:hash role CorporateActionForceCancel
// solhint-disable-next-line max-line-length
bytes32 constant ROLE_CORPORATE_ACTION_FORCE_CANCEL = 0x34c18461eba17dd4b2a410f90e80f2a3d6e466af7753bf1b9519c24697c199f5;

/// @custom:hash role Deactivate
bytes32 constant ROLE_DEACTIVATE = 0x31e3e0f7cd6b1bdc19162dd52d4ce1ed67de0aff8f89b768dcbfad8776b2ae4d;

/// @custom:hash role Documenter
bytes32 constant ROLE_DOCUMENTER = 0xb7b1452b94e2932605f7ad2a3ceba0bafd68db64704c9bd667f27163c57ca319;

/// @custom:hash role FreezeManager
bytes32 constant ROLE_FREEZE_MANAGER = 0x71ae38482e1ab1c28e767d64766d686215b490c8c1bd7dfe6b101525187c2155;

/// @custom:hash role InterestRateManager
bytes32 constant ROLE_INTEREST_RATE_MANAGER = 0xfa80c71f8de1628faf2c0e9bd02c2f4a3da1f16823b75e61e84b90164a07b4a4;

/// @custom:hash role InternalKycManager
bytes32 constant ROLE_INTERNAL_KYC_MANAGER = 0xdd78fdcd1b38a5360405cef8d91e758ad0f42bf2ced681b803b3c2704b0a32a7;

/// @custom:hash role Issuer
bytes32 constant ROLE_ISSUER = 0x5eeaf5602c75bf26e73b5206d0bd6ee82f621166255e5fd73cc06bc7bd84a95f;

/// @custom:hash role KpiManager
bytes32 constant ROLE_KPI_MANAGER = 0x7895574f0552ac1a42245f5d7ea23bea04d0cfbc73df53282d588fdaa00f7fb3;

/// @custom:hash role Kyc
bytes32 constant ROLE_KYC = 0x754f499f9fdfbb089d12bdec817a6863d593d8a3ea7f546c00a5cafd20957bfc;

/// @custom:hash role KycManager
bytes32 constant ROLE_KYC_MANAGER = 0xec811504e835acf29535b5b62307b08000468f0c61ca6163ed6f17a03629b91e;

/// @custom:hash role LoanManager
bytes32 constant ROLE_LOAN_MANAGER = 0xcfd49258c7f1641d56add8e8efadca919969eb6aab447ec47f2ed34c8492547a;

/// @custom:hash role LoansPortfolioManager
bytes32 constant ROLE_LOANS_PORTFOLIO_MANAGER = 0x90f7adc9b7132ce9c095619ba3e77e8505f2824b906ee99892386b8349a016c6;

/// @custom:hash role Locker
bytes32 constant ROLE_LOCKER = 0xd327cd9a2be405896f3d4584b3b437d798833cc4aa0aafb34c870659c0d47184;

/// @custom:hash role MaturityRedeemer
bytes32 constant ROLE_MATURITY_REDEEMER = 0x433f48f8aca23480f6ab07666cbc9131d32a0b4672033453f65e18f4dd390523;

/// @custom:hash role CustomDataManager
bytes32 constant ROLE_CUSTOM_DATA_MANAGER = 0x0b348f171b6004b74a59b08b77c142a65c416e0e20c855602b8b2510951101b0;

/// @custom:hash role NominalValue
bytes32 constant ROLE_NOMINAL_VALUE = 0xebf9ab6852aef7bc1e4068a64bd360845c54d5d95d4fed9fd47c52bbe7c15b8b;

/// @custom:hash role PauseManager
bytes32 constant ROLE_PAUSE_MANAGER = 0x03e7c996eea5565d823330975718325a2eccfaf55d5ec99de9a1d9d7253c318e;

/// @custom:hash role Pauser
bytes32 constant ROLE_PAUSER = 0x3cb8b459fdb6e7dc3d2a2aa529e530f885d45e03584adb438423209c86a2731f;

/// @custom:hash role ProceedRecipientManager
bytes32 constant ROLE_PROCEED_RECIPIENT_MANAGER = 0x29baa8e752c40494481d6b4caa718d054ad999653716d39b1aa896387c68ae78;

/// @custom:hash role ProtectedPartitions
bytes32 constant ROLE_PROTECTED_PARTITIONS = 0x2d40a5b0ae1bfaa74e8787cae4b47373670a5b71b3e6031c4d849ed22e376bfd;

/// @custom:hash role ProtectedPartitionsParticipant
// solhint-disable-next-line max-line-length
bytes32 constant ROLE_PROTECTED_PARTITIONS_PARTICIPANT = 0xda17771b6b3d06197fabbe8db1d7586004df4869992b9c7c7fccec5f36dcf604;

/// @custom:hash role Snapshot
bytes32 constant ROLE_SNAPSHOT = 0xf7d999723d2160432933a2aeffaae83e262a5a46fe94f34614a7676d1d1f67c6;

/// @custom:hash role SsiManager
bytes32 constant ROLE_SSI_MANAGER = 0x3120494a82251fe85b0403877539486dbfcf0f94c20741a3229cfad31f625ee1;

/// @custom:hash role TrexOwner
bytes32 constant ROLE_TREX_OWNER = 0xd9e1264632ee9a37e8673a0c55a0a1d8b38c758e843084168ee08cd2d1f7e6f0;

/// @custom:hash role WildCard
bytes32 constant ROLE_WILD_CARD = 0x309337df95ff8f6d0075117d46b40fd103d8ae87db1914f1c60acb63487fb157;

function _buildRoles(bytes32 role1, bytes32 role2) pure returns (bytes32[] memory roles_) {
    roles_ = new bytes32[](2);
    roles_[0] = role1;
    roles_[1] = role2;
}
