export default {
  tabs: {
    program: "Program coupon",
    see: "See coupon",
  },
  program: {
    input: {
      expired: "You cannot program a coupon since the bond is expired.",
      recordDate: {
        label: "Record date",
        placeholder: "Select record date",
        tooltip:
          "Coupon’s record date.  A snapshot of Bond holder’s balances will be triggered on this date.",
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
    success: "Success: ",
    creationSuccessful: "coupon creation was successful",
    error: "Error: ",
    creationFailed: "coupon creation failed",
  },
};
