// SPDX-License-Identifier: Apache-2.0

export default {
  title: "Proceed Recipients",
  subtitle: "List of proceed recipients of the bond",
  add: "Add",
  table: {
    fields: {
      address: "Address",
      data: "Data",
      actions: "Actions",
      edit: "Edit",
      remove: "Remove",
    },
  },
  create: {
    title: "Add Proceed Recipient",
    description: "Fill in the form below to add a proceed recipient",
    form: {
      address: {
        label: "Address",
        placeholder: "0.0.1234567",
      },
      data: {
        label: "Data",
        placeholder: "0x",
        invalidHexFormat: "Invalid hex format",
      },
    },
    buttons: {
      cancel: "Cancel",
      add: "Add",
    },
    messages: {
      success: "Success: ",
      descriptionSuccess: "Proceed recipient creation was successful",
      error: "Error: ",
      descriptionFailed: "Proceed recipient creation failed",
    },
  },
  update: {
    title: "Update Proceed Recipient",
    description: "Fill in the form below to update a proceed recipient",
    form: {
      address: {
        label: "Address",
        placeholder: "0.0.1234567",
      },
      data: {
        label: "Data",
        placeholder: "0x",
        invalidHexFormat: "Invalid hex format",
      },
    },
    buttons: {
      cancel: "Cancel",
      update: "Update",
    },
    messages: {
      success: "Success: ",
      descriptionSuccess: "Proceed recipient update was successful",
      error: "Error: ",
      descriptionFailed: "Proceed recipient update failed",
    },
  },
  remove: {
    confirmPopUp: {
      title: "Remove Proceed Recipient",
      description: "Are you sure you want to remove this proceed recipient?",
      confirmText: "Remove",
      cancelText: "Cancel",
    },
    messages: {
      success: "Success: ",
      descriptionSuccess: "The removal operation has been executed successfully",
      error: "Error: ",
      descriptionFailed: "The removal operation has failed",
    },
  },
};
