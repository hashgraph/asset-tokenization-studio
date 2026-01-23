// SPDX-License-Identifier: Apache-2.0

export default {
  list: {
    title: "External Pause List",
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
    title: "Add External Pauses",
    form: {
      selector: {
        label: "External Pause ID",
        placeholder: "Select",
      },
      externalPauseSelected: "External Pauses selected",
      add: "Add",
      cancel: "Cancel",
    },
  },
  remove: {
    title: "Remove External pause",
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
