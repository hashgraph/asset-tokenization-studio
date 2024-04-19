export default {
  tabs: {
    program: "Program dividend",
    see: "See dividend",
  },
  program: {
    input: {
      recordDate: {
        label: "Record date",
        placeholder: "Select record date",
        tooltip:
          "Dividend’s record date.  A snapshot of Equity holder’s balances will be triggered on this date.",
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
      general:
        "Sorry, there was an error. Please check data and try again, please",
    },
    details: {
      title: "Detail",
      paymentDay: "Payment day",
      amount: "Amount",
    },
  },
  messages: {
    succes: "Success: ",
    creationSuccessful: "Dividend creation was successful",
    error: "Error: ",
    creationFailed: "Dividend creation failed",
  },
};
