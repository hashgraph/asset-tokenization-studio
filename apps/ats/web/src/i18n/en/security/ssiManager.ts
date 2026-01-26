// SPDX-License-Identifier: Apache-2.0

export default {
  revocation: {
    title: "Revocation Registry Address",
    change: "Change",
    form: {
      account: {
        label: "Contract ID",
        placeholder: "0.0.1234567",
      },
    },
  },
  list: {
    title: "Issuers",
    add: "Add",
  },
  table: {
    fields: {
      accountId: "Account ID",
      actions: "Actions",
      remove: "Remove",
    },
  },
  create: {
    title: "Add Issuer",
    description: "",
    form: {
      account: {
        label: "Account ID",
        placeholder: "0.0.1234567",
      },
    },
  },
  removePopUp: {
    title: "Remove Issuer",
    description: "Are you sure you want to remove this issuer?",
    confirmText: "Remove",
    cancelText: "Cancel",
  },
  messages: {
    success: "Success: ",
    descriptionSuccess: "The SSI Manager operation has been executed successfully",
    error: "Error: ",
    descriptionFailed: "The SSI Manager operation has failed",
  },
};
