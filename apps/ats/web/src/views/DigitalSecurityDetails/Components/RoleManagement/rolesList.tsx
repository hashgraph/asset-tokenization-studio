// SPDX-License-Identifier: Apache-2.0

import { SecurityRole } from "../../../../utils/SecurityRole";

export type TSecurityType = "BOND" | "EQUITY";

export type TRole = {
  label: string;
  value: SecurityRole;
  allowedSecurities: TSecurityType[];
};

export const rolesList: TRole[] = [
  {
    label: "admin",
    value: SecurityRole._DEFAULT_ADMIN_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "minter",
    value: SecurityRole._ISSUER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "freezer",
    value: SecurityRole._FREEZE_MANAGER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "controller",
    value: SecurityRole._CONTROLLER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "pause",
    value: SecurityRole._PAUSER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "controlList",
    value: SecurityRole._CONTROLLIST_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "corporateActions",
    value: SecurityRole._CORPORATEACTIONS_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "document",
    value: SecurityRole._DOCUMENTER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "snapshot",
    value: SecurityRole._SNAPSHOT_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "bondManager",
    value: SecurityRole._BOND_MANAGER_ROLE,
    allowedSecurities: ["BOND"],
  },
  {
    label: "adjustmentBalance",
    value: SecurityRole._ADJUSTMENT_BALANCE_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "locker",
    value: SecurityRole._LOCKER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "cap",
    value: SecurityRole._CAP_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "kyc",
    value: SecurityRole._KYC_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "ssiManager",
    value: SecurityRole._SSI_MANAGER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "clearing",
    value: SecurityRole._CLEARING_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "clearingValidator",
    value: SecurityRole._CLEARING_VALIDATOR_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "pauseManager",
    value: SecurityRole._PAUSE_MANAGER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "controlListManager",
    value: SecurityRole._CONTROL_LIST_MANAGER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "kycListManager",
    value: SecurityRole._KYC_MANAGER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "internalKYCManager",
    value: SecurityRole._INTERNAL_KYC_MANAGER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "trexOwner",
    value: SecurityRole._TREX_OWNER_ROLE,
    allowedSecurities: ["BOND", "EQUITY"],
  },
  {
    label: "proceedRecipientManager",
    value: SecurityRole._PROCEED_RECIPIENT_MANAGER_ROLE,
    allowedSecurities: ["BOND"],
  },
];
