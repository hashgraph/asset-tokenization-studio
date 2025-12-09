// SPDX-License-Identifier: Apache-2.0

export default {
  tabs: {
    program: "Program coupon",
    see: "See coupon",
    holders: "Holders",
    list: "List",
  },
  list: {
    columns: {
      id: "ID",
      recordDate: "Record Date",
      executionDate: "Execution Date",
      rate: "Coupon Rate",
      period: "Period",
      snapshotId: "Snapshot",
    },
    emptyTable: "No coupons found",
  },
  program: {
    input: {
      expired: "You cannot program a coupon since the bond is expired.",
      recordDate: {
        label: "Record date",
        placeholder: "Select record date",
        tooltip: "Coupon’s record date.  A snapshot of Bond holder’s balances will be triggered on this date.",
      },
      paymentDate: {
        label: "Payment date",
        placeholder: "Select payment date",
        tooltip: "Coupon’s execution date, must occur after the record date.",
      },
      rate: {
        label: "Coupon rate",
        placeholder: "0,123%",
        tooltip: "Interest rate for the coupon.",
      },
      startDate: {
        label: "Start date",
        placeholder: "Select start date",
        tooltip: "Coupon’s start date, must occur before the end date.",
      },
      endDate: {
        label: "End date",
        placeholder: "Select end date",
        tooltip: "Coupon’s end date, Accrual period correspond to the period between start and end date.",
      },
      fixingDate: {
        label: "Fixing date",
        placeholder: "Select fixing date",
        tooltip: "Coupon’s fixing date, floating rate coupons only.",
      },
    },
  },
  see: {
    input: {
      coupon: {
        label: "Coupon ID",
        placeholder: "Add ID",
        tooltip: "ID of the coupon to display.",
      },
      account: {
        label: "Account ID",
        placeholder: "Add ID",
        tooltip: "ID of the account to display the coupon for.",
      },
    },
    error: {
      general: "Sorry, there was an error. Please check data and try again, please",
    },
    details: {
      title: "Detail",
      paymentDay: "Payment day",
      startDay: "start day",
      endDay: "end day",
      fixingDay: "fixing day",
      amount: "Amount",
      numerator: "Numerator",
      denominator: "Denominator",
      recordDateReached: "Record Date Reached",
    },
  },
  holders: {
    title: "Holders",
    couponIdInput: {
      label: "Coupon ID",
      placeholder: "1",
      tooltip: "ID of the coupon to display.",
    },
    searchButton: "Search",
    emptyTable: "No data",
    table: {
      couponId: "Coupon ID",
      holderAddress: "Holder address",
    },
  },
  messages: {
    success: "Success: ",
    creationSuccessful: "coupon creation was successful",
    error: "Error: ",
    creationFailed: "coupon creation failed",
  },
};
