// SPDX-License-Identifier: Apache-2.0

import dividends from "./dividends";
import coupons from "./coupons";
import roleManagement from "./roleManagement";
import management from "./management";
import allowedList from "./allowedList";
import votingRights from "./votingRight";
import balanceAdjustment from "./balanceAdjustment";
import locker from "./locker";
import cap from "./cap";
import hold from "./hold";
import kyc from "./kyc";
import ssiManager from "./ssiManager";
import clearingOperations from "./clearingOperations";
import externalPause from "./externalPause";
import externalControl from "./externalControl";
import externalKYC from "./externalKYC";
import proceedRecipients from "./proceedRecipients";

export default {
  header: {
    title: "Digital security details",
  },
  tabs: {
    balance: "Balance",
    allowedList: "Allowed list",
    blockedList: "Blocked list",
    details: "Details",
    dividends: "Dividends",
    balanceAdjustment: "Balance Adjustment",
    coupons: "Coupons",
    votingRights: "Voting rights",
    roleManagement: "Role management",
    management: "Management",
    locker: "Locker",
    cap: "Cap",
    hold: "Hold",
    kyc: "KYC",
    ssiManager: "SSI Manager",
    clearingOperations: "Clearing Operations",
    configuration: "Configuration",
    operations: "Operations",
    control: "Control",
    corporateActions: "Corporate Actions",
    externalControlList: "External Control",
    externalPause: "External Pause",
    externalKYCList: "External KYC",
    freeze: "Freeze",
    proceedRecipients: "Proceed Recipients",
  },
  actions: {
    redeem: "Redeem",
    transfer: "Transfer",
    mint: "Mint",
    freeze: "Freeze / Unfreeze",
    forceTransfer: "Force transfer",
    forceRedeem: "Force redeem",
    dangerZone: {
      title: "Danger zone",
      pauseSecurityTokenTitle: "Pause Security Token",
      pauseSecurityTokenDescription:
        "Pause all activity related to the security token as a protective measure. While paused, transfers and interactions will be restricted",
      buttonActive: "Active",
      buttonInactive: "Inactive",
      clearingModeTitle: "Clearing mode",
      clearingModeDescription:
        "Restrict token interactions to clearing operations only. While enabled, other types of transactions will be blocked",
      activate: "Activate",
      deactivate: "Deactivate",
      internalKYCManagerTitle: "Internal KYC",
      internalKYCManagerDescription: "While activated, internal KYC will be enable",
    },
  },
  dividends,
  balanceAdjustment,
  coupons,
  balance: {
    search: {
      title: "Display balances",
      subtitle: "Add the ID account to preview its balance",
      placeholder: "0.0.19253",
      button: "Search ID",
    },
    details: {
      title: "Details",
      availableBalance: "Available balance",
      lockBalance: "Lock balance",
      heldBalance: "Held balance",
      clearedBalance: "Cleared balance",
      frozenBalance: "Frozen balance",
    },
    error: {
      targetId: "Sorry, there was an error. Probably wrong address",
    },
  },
  roleManagement,
  management,
  allowedList,
  votingRights,
  locker,
  cap,
  hold,
  kyc,
  ssiManager,
  clearingOperations,
  externalPause,
  externalControl,
  externalKYC,
  proceedRecipients,
  benefits: {
    dividends: "Dividends",
    balanceAdjustments: "Balance Adjustments",
    coupons: "Coupons",
    id: "Id",
    recordDate: "Record date",
    executionDate: "Execution date",
    dividendAmount: "Dividend amount",
    couponRate: "Rate",
    snapshot: "Snapshot Id",
    factor: "Factor",
    decimals: "Decimals",
  },
  bond: {
    updateMaturityDate: {
      toast: {
        title: "Confirmation",
        subtitle: "Are you sure you want to change the maturity date?",
        cancelButtonText: "Cancel",
        confirmButtonText: "Confirm",
      },
      messages: {
        success: "Success: ",
        updateMaturityDateSuccessful: "Maturity date has been updated successfully",
        error: "Error: ",
        updateMaturityDateFailed: "Update maturity date failed",
      },
    },
    updateCompliance: {
      toast: {
        title: "Confirmation",
        subtitle: "Are you sure you want to change the compliance?",
        cancelButtonText: "Cancel",
        confirmButtonText: "Confirm",
      },
      messages: {
        success: "Success: ",
        updateComplianceSuccessful: "Compliance has been updated successfully",
        error: "Error: ",
        updateComplianceFailed: "Update compliance failed",
      },
    },
    updateIdentityRegistry: {
      toast: {
        title: "Confirmation",
        subtitle: "Are you sure you want to change the identity registry?",
        cancelButtonText: "Cancel",
        confirmButtonText: "Confirm",
      },
      messages: {
        success: "Success: ",
        updateIdentityRegistrySuccessful: "Identity registry has been updated successfully",
        error: "Error: ",
        updateIdentityRegistryFailed: "Update identity registry failed",
      },
    },
  },
};
