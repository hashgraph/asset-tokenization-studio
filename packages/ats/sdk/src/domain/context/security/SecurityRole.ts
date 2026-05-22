// SPDX-License-Identifier: Apache-2.0

import { ethers } from "ethers";
import { keccak256 } from "js-sha3";

export enum SecurityRole {
  _DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000",
  _ISSUER_ROLE = "0x5eeaf5602c75bf26e73b5206d0bd6ee82f621166255e5fd73cc06bc7bd84a95f",
  _CONTROLLER_ROLE = "0xb4d2b850c3ed8a234d390d5c157bbb1824883213c335ffe2a0f0761bb168713e",
  _PAUSER_ROLE = "0x3cb8b459fdb6e7dc3d2a2aa529e530f885d45e03584adb438423209c86a2731f",
  _CONTROLLIST_ROLE = "0x6ed9a91e996c6475ecdc28ecbdbe9bd1122fc62b30cdbe6da8271884b51ec74d",
  _CORPORATEACTIONS_ROLE = "0xa1acfc499025c99f55059195e6276f639d34a18aad7b8121b9192b7f438c55cd",
  _DOCUMENTER_ROLE = "0xb7b1452b94e2932605f7ad2a3ceba0bafd68db64704c9bd667f27163c57ca319",
  _SNAPSHOT_ROLE = "0xf7d999723d2160432933a2aeffaae83e262a5a46fe94f34614a7676d1d1f67c6",
  _LOCKER_ROLE = "0xd327cd9a2be405896f3d4584b3b437d798833cc4aa0aafb34c870659c0d47184",
  _CAP_ROLE = "0x58d502b7184e1a264e0cacf1a19a6c268356c6d9fda5ad83ab3b599cd3b7f41c",
  _BOND_MANAGER_ROLE = "0x68fe577385095e80beadf873ac12a3100f9a9d1b6d40f0d123eecf3d01bf5c49",
  _ADJUSTMENT_BALANCE_ROLE = "0xb246506a8ded65dd6360e8ce033fd9462936d1be64fb9f85c5f60d28cd3ca6da",
  _PROTECTED_PARTITION_ROLE = "0x2d40a5b0ae1bfaa74e8787cae4b47373670a5b71b3e6031c4d849ed22e376bfd",
  _PROTECTED_PARTITIONS_PARTICIPANT_ROLE = "0xda17771b6b3d06197fabbe8db1d7586004df4869992b9c7c7fccec5f36dcf604",
  _WILD_CARD_ROLE = "0x309337df95ff8f6d0075117d46b40fd103d8ae87db1914f1c60acb63487fb157",
  _SSI_MANAGER_ROLE = "0x3120494a82251fe85b0403877539486dbfcf0f94c20741a3229cfad31f625ee1",
  _KYC_ROLE = "0x754f499f9fdfbb089d12bdec817a6863d593d8a3ea7f546c00a5cafd20957bfc",
  _CLEARING_ROLE = "0xd0fe259e861ec493f60fb83851f1a173155b0f2acc3da153de2a23fb0ad26db6",
  _CLEARING_VALIDATOR_ROLE = "0xa24ef577c383d98a9326f932c69c76129dd89a71abcb626993d9f047f4e74abb",
  _PAUSE_MANAGER_ROLE = "0x03e7c996eea5565d823330975718325a2eccfaf55d5ec99de9a1d9d7253c318e",
  _CONTROL_LIST_MANAGER_ROLE = "0xccf29bda8369877bcc921e38f30df86156a571ca5c5b8e777bf7ff75270313ea",
  _KYC_MANAGER_ROLE = "0xec811504e835acf29535b5b62307b08000468f0c61ca6163ed6f17a03629b91e",
  _INTERNAL_KYC_MANAGER_ROLE = "0xdd78fdcd1b38a5360405cef8d91e758ad0f42bf2ced681b803b3c2704b0a32a7",
  _FREEZE_MANAGER_ROLE = "0x71ae38482e1ab1c28e767d64766d686215b490c8c1bd7dfe6b101525187c2155",
  _AGENT_ROLE = "0x9830aa071a741c08855dd42130bdb0ff50f7bdf5a4b72f12181eefded0c6542b",
  _TREX_OWNER_ROLE = "0xd9e1264632ee9a37e8673a0c55a0a1d8b38c758e843084168ee08cd2d1f7e6f0",
  _MATURITY_REDEEMER_ROLE = "0x433f48f8aca23480f6ab07666cbc9131d32a0b4672033453f65e18f4dd390523",
  _PROCEED_RECIPIENT_MANAGER_ROLE = "0x29baa8e752c40494481d6b4caa718d054ad999653716d39b1aa896387c68ae78",
  _INTEREST_RATE_MANAGER_ROLE = "0xfa80c71f8de1628faf2c0e9bd02c2f4a3da1f16823b75e61e84b90164a07b4a4",
  _KPI_MANAGER_ROLE = "0x7895574f0552ac1a42245f5d7ea23bea04d0cfbc73df53282d588fdaa00f7fb3",
  _NOMINAL_VALUE_ROLE = "0xebf9ab6852aef7bc1e4068a64bd360845c54d5d95d4fed9fd47c52bbe7c15b8b",
  _AMORTIZATION_ROLE = "0x0c8c9cf3db23765397bf525e10c9158fd2a7b58b280d5da82a642247779ae3c1",
  _DEACTIVATE_ROLE = "0x145ad831ea56153ed7168c7801290d85409e09d7dec17409bcc37e47a035c79f",
  _METADATA_MANAGER_ROLE = "0x046ae081641a4ef86cb01b128a7c78952aa4b37c6d18f35f8f794b14dcd59797",
}

export function getProtectedPartitionRole(partitionId: string): string {
  let partitionBytes32: string;

  if (ethers.isHexString(partitionId) && partitionId.length === 66) {
    partitionBytes32 = partitionId;
  } else {
    partitionBytes32 = ethers.encodeBytes32String(partitionId);
  }

  const encodedValue = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "bytes32"],
    [SecurityRole._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, partitionBytes32],
  );
  const hash = keccak256(encodedValue);
  return "0x" + hash;
}

export const MAX_ACCOUNTS_ROLES = 10;

export const SecurityRoleLabel = new Map<SecurityRole, string>([
  [SecurityRole._DEFAULT_ADMIN_ROLE, "Owner"],
  [SecurityRole._ISSUER_ROLE, "Issuer"],
  [SecurityRole._CONTROLLER_ROLE, "Controller"],
  [SecurityRole._PAUSER_ROLE, "Pause"],
  [SecurityRole._CONTROLLIST_ROLE, "Control List"],
  [SecurityRole._CORPORATEACTIONS_ROLE, "Corporate Actions"],
  [SecurityRole._DOCUMENTER_ROLE, "Documenter"],
  [SecurityRole._SNAPSHOT_ROLE, "Snapshot"],
  [SecurityRole._LOCKER_ROLE, "Locker"],
  [SecurityRole._CAP_ROLE, "Cap"],
  [SecurityRole._BOND_MANAGER_ROLE, "Bond Manager"],
  [SecurityRole._ADJUSTMENT_BALANCE_ROLE, "Adjustment Balance"],
  [SecurityRole._PROTECTED_PARTITION_ROLE, "Protected Partition"],
  [SecurityRole._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, "Protected Partitions Participant"],
  [SecurityRole._WILD_CARD_ROLE, "Wild Card"],
  [SecurityRole._SSI_MANAGER_ROLE, "SSI Manager"],
  [SecurityRole._KYC_ROLE, "KYC"],
  [SecurityRole._CLEARING_ROLE, "Clearing"],
  [SecurityRole._CLEARING_VALIDATOR_ROLE, "Clearing Validator"],
  [SecurityRole._PAUSE_MANAGER_ROLE, "Pause Manager"],
  [SecurityRole._CONTROL_LIST_MANAGER_ROLE, "Control List Manager"],
  [SecurityRole._KYC_MANAGER_ROLE, "Kyc List Manager"],
  [SecurityRole._INTERNAL_KYC_MANAGER_ROLE, "Internal Kyc Manager"],
]);
