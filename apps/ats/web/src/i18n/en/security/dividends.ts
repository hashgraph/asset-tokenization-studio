//SPDX-License-Identifier: Apache-2.0

export default {
  tabs: {
    program: "Program dividend",
    see: "See dividend",
    holders: "Holders",
    list: "List",
  },
  list: {
    columns: {
      id: "ID",
      recordDate: "Record Date",
      executionDate: "Execution Date",
      dividendAmount: "Dividend Amount",
      snapshotId: "Snapshot",
    },
    emptyTable: "No dividends found",
  },
  program: {
    input: {
      recordDate: {
        label: "Record date",
        placeholder: "Select record date",
        tooltip: "Dividend’s record date.  A snapshot of Equity holder’s balances will be triggered on this date.",
      },
      paymentDate: {
        label: "Payment date",
        placeholder: "Select payment date",
        tooltip: "Dividend’s execution date, must occur after the record date.",
      },
      amount: {
        label: "Dividend amount",
        placeholder: "000 $",
        tooltip: "Amount per equity that will be paid to equity holder’s.",
      },
    },
  },
  see: {
    input: {
      dividend: {
        label: "Dividend ID",
        placeholder: "Add ID",
        tooltip: "ID of the dividend to display.",
      },
      account: {
        label: "Account ID",
        placeholder: "Add ID",
        tooltip: "ID of the account to display the dividend for.",
      },
    },
    error: {
      general: "Sorry, there was an error. Please check data and try again, please",
    },
    details: {
      title: "Detail",
      paymentDay: "Payment day",
      balance: "Balance",
      amount: "Amount",
      recordDateReached: "Record date reached",
    },
  },
  holders: {
    title: "Holders",
    dividendIdInput: {
      label: "Dividend ID",
      placeholder: "1",
      tooltip: "ID of the dividend to display.",
    },
    searchButton: "Search",
    emptyTable: "No data",
    table: {
      dividendId: "Dividend ID",
      holderAddress: "Holder address",
    },
  },
  messages: {
    succes: "Success: ",
    creationSuccessful: "Dividend creation was successful",
    error: "Error: ",
    creationFailed: "Dividend creation failed",
  },
};
