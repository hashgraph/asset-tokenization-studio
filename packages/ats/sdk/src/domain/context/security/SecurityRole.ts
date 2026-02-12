// SPDX-License-Identifier: Apache-2.0

import { ethers } from "ethers";
import { keccak256 } from "js-sha3";

export enum SecurityRole {
  _DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000",
  _ISSUER_ROLE = "0x4be32e8849414d19186807008dabd451c1d87dae5f8e22f32f5ce94d486da842",
  _CONTROLLER_ROLE = "0xa72964c08512ad29f46841ce735cff038789243c2b506a89163cc99f76d06c0f",
  _PAUSER_ROLE = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb",
  _CONTROLLIST_ROLE = "0xca537e1c88c9f52dc5692c96c482841c3bea25aafc5f3bfe96f645b5f800cac3",
  _CORPORATEACTIONS_ROLE = "0x8a139eeb747b9809192ae3de1b88acfd2568c15241a5c4f85db0443a536d77d6",
  _DOCUMENTER_ROLE = "0x83ace103a76d3729b4ba1350ad27522bbcda9a1a589d1e5091f443e76abccf41",
  _SNAPSHOT_ROLE = "0x3fbb44760c0954eea3f6cb9f1f210568f5ae959dcbbef66e72f749dbaa7cc2da",
  _LOCKER_ROLE = "0xd8aa8c6f92fe8ac3f3c0f88216e25f7c08b3a6c374b4452a04d200c29786ce88",
  _CAP_ROLE = "0xb60cac52541732a1020ce6841bc7449e99ed73090af03b50911c75d631476571",
  _BOND_MANAGER_ROLE = "0x8e99f55d84328dd46dd7790df91f368b44ea448d246199c88b97896b3f83f65d",
  _ADJUSTMENT_BALANCE_ROLE = "0x6d0d63b623e69df3a6ea8aebd01f360a0250a880cbc44f7f10c49726a80a78a9",
  _PROTECTED_PARTITION_ROLE = "0x8e359333991af626d1f6087d9bc57221ef1207a053860aaa78b7609c2c8f96b6",
  _PROTECTED_PARTITIONS_PARTICIPANT_ROLE = "0xdaba153046c65d49da6a7597abc24374aa681e3eee7004426ca6185b3927a3f5",
  _WILD_CARD_ROLE = "0x96658f163b67573bbf1e3f9e9330b199b3ac2f6ec0139ea95f622e20a5df2f46",
  _SSI_MANAGER_ROLE = "0x0995a089e16ba792fdf9ec5a4235cba5445a9fb250d6e96224c586678b81ebd0",
  _KYC_ROLE = "0x6fbd421e041603fa367357d79ffc3b2f9fd37a6fc4eec661aa5537a9ae75f93d",
  _CLEARING_ROLE = "0x2292383e7bb988fb281e5195ab88da11e62fec74cf43e8685cff613d6b906450",
  _CLEARING_VALIDATOR_ROLE = "0x7b688898673e16c47810f5da9ce1262a3d7d022dfe27c8ff9305371cd435c619",
  _PAUSE_MANAGER_ROLE = "0xbc36fbd776e95c4811506a63b650c876b4159cb152d827a5f717968b67c69b84",
  _CONTROL_LIST_MANAGER_ROLE = "0x0e625647b832ec7d4146c12550c31c065b71e0a698095568fd8320dd2aa72e75",
  _KYC_MANAGER_ROLE = "0x8ebae577938c1afa7fb3dc7b06459c79c86ffd2ac9805b6da92ee4cbbf080449",
  _INTERNAL_KYC_MANAGER_ROLE = "0x3916c5c9e68488134c2ee70660332559707c133d0a295a25971da4085441522e",
  _FREEZE_MANAGER_ROLE = "0xd0e5294c1fc630933e135c5b668c5d577576754d33964d700bbbcdbfd7e1361b",
  _AGENT_ROLE = "0xc4aed0454da9bde6defa5baf93bb49d4690626fc243d138104e12d1def783ea6",
  _TREX_OWNER_ROLE = "0x03ce2fdc316501dd97f5219e6ad908a3238f1e90f910aa17b627f801a6aafab7",
  _MATURITY_REDEEMER_ROLE = "0xa0d696902e9ed231892dc96649f0c62b808a1cb9dd1269e78e0adc1cc4b8358c",
  _PROCEED_RECIPIENT_MANAGER_ROLE = "0xebc53fe99fea28c7aa9476a714959af5b931f34a8a8734365ec63113198d512f",
  _INTEREST_RATE_MANAGER_ROLE = "0xa174f099c94c902831d8b8a07810700505da86a76ea0bcb7629884ef26cf682e",
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
