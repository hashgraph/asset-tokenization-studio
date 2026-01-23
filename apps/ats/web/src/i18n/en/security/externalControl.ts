// SPDX-License-Identifier: Apache-2.0

export default {
  list: {
    title: "External Control List",
    add: "Add",
    removeItemsSelected: "Remove items selected",
  },
  table: {
    fields: {
      id: "ID",
      type: "Type",
      blacklist: "Blacklist",
      whitelist: "Whitelist",
      actions: "Actions",
      revoke: "Remove",
    },
    empty: "No results found",
  },
  create: {
    title: "Add External Controls",
    form: {
      selector: {
        label: "External Control ID",
        placeholder: "Select",
      },
      externalControlSelected: "External controls selected",
      add: "Add",
      cancel: "Cancel",
    },
  },
  remove: {
    title: "Remove External Control",
    description: "Are you sure you want to remove it?",
    confirmText: "Remove",
    cancelText: "Cancel",
  },
  messages: {
    success: "Success: ",
    descriptionSuccess: "The KYC operation has been executed successfully",
    error: "Error: ",
    descriptionFailed: "The KYC operation has failed",
  },
};
