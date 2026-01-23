// SPDX-License-Identifier: Apache-2.0

export default {
  program: {
    title: "Program Balance Adjustment",
    form: {
      executionDate: {
        label: "Execution date",
        placeholder: "Select execution date",
        tooltip: "Dividend’s record date.  A snapshot of Equity holder’s balances will be triggered on this date.",
      },
      factor: {
        label: "Factor",
        placeholder: "Factor",
      },
      decimals: {
        label: "Decimals",
        placeholder: "Decimals",
      },
    },
  },
  messages: {
    success: "Success: ",
    creationSuccessful: "The schedule for balance adjustment was successful",
    error: "Error: ",
    creationFailed: "The schedule for balance adjustment failed",
  },
};
