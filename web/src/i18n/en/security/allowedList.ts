export default {
  search: {
    title: "Control list",
    placeholder: "Enter account",
    button: "Add account",
  },
  table: {
    account: "Account ID",
    action: "Action",
  },
  popUp: {
    title: "Remove account from list",
    description: "Are you sure you want to remove this account from list?",
    confirmText: "Remove",
    cancelText: "Cancel",
  },
  messages: {
    succes: "Success: ",
    addToControlListSuccessful: "Add to control list was successful",
    removeFromControlListSuccessful: "Remove from control list was successful",
    error: "Error: ",
    addFailed: "Add to control list failed",
    removeFailed: "Remove from control list failed",
    operationsError: {
      approval: {
        title: "Account is not in white list",
        description: "Add account to Approval list",
      },
      block: {
        title: "Account is in block list",
        description: "Remove account from Block list",
      },
    },
  },
};
