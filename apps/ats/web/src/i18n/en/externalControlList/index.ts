// SPDX-License-Identifier: Apache-2.0

export default {
  list: {
    header: {
      createNewExternalControl: "Create new external control",
      importControlList: "Import a control list",
      title: "External Control list",
    },
    table: {
      address: "Address",
      state: "Type",
      actions: "Actions",
      blacklist: "Blacklist",
      whitelist: "Whitelist",
      empty: "No results found",
    },
    modal: {
      removeExternalControlPopUp: {
        title: "Remove External Control",
        description: "Are you sure you want to remove this external control? This action cannot be undone.",
        confirmText: "Yes, remove it",
        cancelText: "Cancel",
      },
    },
    messages: {
      removeExternalControl: {
        success: "Success: ",
        descriptionSuccess: "The external control has been removed",
        error: "Deletion failed: ",
        descriptionFailed: "There was an error deleting the external control. Please try again",
      },
      changeState: {
        success: "Success: ",
        descriptionSuccess: "The external control state has been changed",
        error: "State change failed: ",
        descriptionFailed: "There was an error updating the external control state. Please try again",
      },
    },
  },
  add: {
    title: "Add External Control",
    subtitle: "Add an existing external control with its ID",
    mandatoryFields: "*Mandatory fields",
    input: {
      id: {
        label: "External Control ID*",
        placeholder: "0.0.12345",
      },
      type: {
        label: "Type*",
        placeholder: "Select external control type",
      },
    },
    create: "Add external control",
    cancel: "Cancel",
    messages: {
      addExternalControl: {
        success: "Success: ",
        descriptionSuccess: "The external control has been imported",
        error: "Failed: ",
        descriptionFailed: "There was an error importing the external control. Please try again",
      },
      addAddressControl: {
        success: "Success: ",
        descriptionSuccess: "The account has been added",
        error: "Failed: ",
        descriptionFailed: "There was an error adding the account. Please try again",
      },
      removeAddressControl: {
        success: "Success: ",
        descriptionSuccess: "The account has been removed",
        error: "Failed: ",
        descriptionFailed: "There was an error removing the account. Please try again",
      },
      isAddressAuthorized: {
        success: "Success: ",
        descriptionSuccess: "The account is authorized",
        error: "Failed: ",
        descriptionFailed: "There was an error checking the account. Please try again",
      },
      isAddressNotAuthorized: {
        success: "Success: ",
        descriptionSuccess: "The account is NOT authorized",
        error: "Failed: ",
        descriptionFailed: "There was an error checking the account. Please try again",
      },
      updateExternalControl: {
        success: "Success: ",
        descriptionSuccess: "The external control list has been updated",
        error: "Failed: ",
        descriptionFailed: "There was an error updating the external control list. Please try again",
      },
    },
  },
  create: {
    title: "External Control creation",
    subtitle: "Create a new external control to be used for securities",
    mandatoryFields: "*Mandatory fields",
    input: {
      type: {
        label: "Type",
        placeholder: "Choose the type of the control list",
      },
    },
    create: "Create external control",
    cancel: "Cancel",
    messages: {
      createExternalControl: {
        success: "Success: ",
        descriptionSuccess: "The external control has been created",
        error: "Failed: ",
        descriptionFailed: "There was an error creating the external control. Please try again",
      },
    },
  },
  addAddress: {
    title: "Add Account",
    description: "Enter the account address to add it to external control.",
    input: {
      label: "Account Address",
      placeholder: "0.0.123456",
    },
    add: "Add",
    cancel: "Cancel",
  },
  removeAddress: {
    title: "Remove Account",
    description: "Enter the account address to remove it from external control.",
    input: {
      label: "Account Address",
      placeholder: "0.0.123456",
    },
    remove: "Remove",
    cancel: "Cancel",
  },
  checkAddress: {
    title: "Check Account",
    description: "Enter the account address to check it in external control.",
    input: {
      label: "Account Address",
      placeholder: "0.0.123456",
    },
    check: "Check",
    cancel: "Cancel",
  },
};
