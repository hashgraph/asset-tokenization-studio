import dividends from "./dividends";
import coupons from "./coupons";
import roleManagement from "./roleManagement";
import allowedList from "./allowedList";
import votingRights from "./votingRight";

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
    coupons: "Coupons",
    votingRights: "Voting rights",
    roleManagement: "Role management",
  },
  actions: {
    redeem: "Redeem",
    transfer: "Transfer",
    mint: "Mint",
    forceTransfer: "Force transfer",
    forceRedeem: "Force redeem",
    dangerZone: {
      title: "Danger zone",
      subtitle: "Pause security token",
      buttonActive: "Active",
      buttonInactive: "Inactive",
    },
  },
  dividends,
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
    },
    error: {
      targetId: "Sorry, there was an error. Probably wrong address",
    },
  },
  roleManagement,
  allowedList,
  votingRights,
  benefits: {
    dividends: "Dividends",
    coupons: "Coupons",
    id: "Id",
    recordDate: "Record date",
    executionDate: "Execution date",
    dividendAmount: "Dividend amount",
    couponRate: "Rate",
    snapshot: "Snapshot Id",
  },
};
