export default {
  tabs: {
    program: "Program voting rights",
    see: "See voting rights",
  },
  program: {
    input: {
      name: {
        label: "Name",
        placeholder: "Enter name",
        tooltip:
          "Name that will be assigned to the voting right. This name is only used for identification/display purposes. ",
      },
      date: {
        label: "Date",
        placeholder: "Select day",
        tooltip:
          "Voting right’s record date. A snapshot of Equity holder’s balances will be triggered on this date.",
      },
    },
    button: "Program vote",
  },
  see: {
    input: {
      voting: {
        label: "Voting ID",
        placeholder: "Add ID",
        tooltip: "ID of the voting right to display.",
      },
      account: {
        label: "Account ID",
        placeholder: "Add ID",
        tooltip: "ID of the account to display the voting right for.",
      },
    },
    details: {
      title: "Voting rights programmed as {{ name }}",
      number: "Number of votes: {{ number }}",
      pending: "The voting is pending",
    },
  },
  messages: {
    success: "Success: ",
    descriptionSuccess:
      "The voting rights operation has been executed successfully",
    error: "Error: ",
    descriptionFailed: "The voting rights operation has failed",
  },
};
