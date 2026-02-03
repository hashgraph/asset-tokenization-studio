// SPDX-License-Identifier: Apache-2.0

export default {
  list: {
    title: "External KYC List",
    add: "Add",
    removeItemsSelected: "Remove items selected",
  },
  table: {
    fields: {
      id: "ID",
      state: "State",
      activated: "Activated",
      deactivated: "Deactivated",
      actions: "Actions",
      revoke: "Remove",
    },
    empty: "No results found",
  },
  create: {
    title: "Add External KYCs",
    form: {
      selector: {
        label: "External KYC ID",
        placeholder: "Select",
      },
      externalKYCSelected: "External KYCs selected",
      add: "Add",
      cancel: "Cancel",
    },
  },
  remove: {
    title: "Remove External KYC",
    description: "Are you sure you want to remove it?",
    confirmText: "Remove",
    cancelText: "Cancel",
  },
  messages: {
    updateExternalKYC: {
      success: "Success: ",
      descriptionSuccess: "The external KYC list has been executed updated",
      error: "Error: ",
      descriptionFailed: "The KYC operation has failed",
    },
    success: "Success: ",
    descriptionSuccess: "The KYC operation has been executed successfully",
    error: "Error: ",
    descriptionFailed: "The KYC operation has failed",
  },
};
