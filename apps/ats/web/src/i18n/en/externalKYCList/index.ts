// SPDX-License-Identifier: Apache-2.0

export default {
  list: {
    header: {
      createNewExternalKYC: "Create new external KYC",
      importKYCList: "Import a KYC list",
      title: "External KYC list",
    },
    table: {
      address: "Address",
      actions: "Actions",
      empty: "No results found",
    },
    modal: {
      removeExternalKYCPopUp: {
        title: "Remove External KYC",
        description: "Are you sure you want to remove this external KYC? This action cannot be undone.",
        confirmText: "Yes, remove it",
        cancelText: "Cancel",
      },
    },
    messages: {
      removeExternalKYC: {
        success: "Success: ",
        descriptionSuccess: "The external KYC has been removed",
        error: "Deletion failed: ",
        descriptionFailed: "There was an error deleting the external KYC. Please try again",
      },
      changeState: {
        success: "Success: ",
        descriptionSuccess: "The external KYC state has been changed",
        error: "State change failed: ",
        descriptionFailed: "There was an error updating the external KYC state. Please try again",
      },
    },
  },
  add: {
    title: "Add External KYC",
    subtitle: "Add an existing external KYC with its ID",
    mandatoryFields: "*Mandatory fields",
    input: {
      id: {
        label: "External KYC ID*",
        placeholder: "0.0.12345",
      },
      type: {
        label: "Type*",
        placeholder: "Select external KYC type",
      },
    },
    create: "Add external KYC",
    cancel: "Cancel",
    messages: {
      addExternalKYC: {
        success: "Success: ",
        descriptionSuccess: "The external KYC has been imported",
        error: "Failed: ",
        descriptionFailed: "There was an error importing the external KYC. Please try again",
      },
      addAddressKYC: {
        success: "Success: ",
        descriptionSuccess: "The account has been added",
        error: "Failed: ",
        descriptionFailed: "There was an error adding the account. Please try again",
      },
      removeAddressKYC: {
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
      updateExternalKYC: {
        success: "Success: ",
        descriptionSuccess: "The external KYC list has been updated",
        error: "Failed: ",
        descriptionFailed: "There was an error updating the external KYC list. Please try again",
      },
    },
  },
  create: {
    title: "External KYC creation",
    subtitle: "Create a new external KYC to be used for securities",
    mandatoryFields: "*Mandatory fields",
    input: {
      type: {
        label: "Type",
        placeholder: "Choose the type of the KYC list",
      },
    },
    create: "Create external KYC",
    cancel: "Cancel",
    messages: {
      createExternalKYC: {
        success: "Success: ",
        descriptionSuccess: "The external KYC has been created",
        error: "Failed: ",
        descriptionFailed: "There was an error creating the external KYC. Please try again",
      },
    },
  },
  addAddress: {
    title: "Add Account",
    description: "Enter the account address to add it to external KYC.",
    input: {
      label: "Account Address",
      placeholder: "0.0.123456",
    },
    add: "Add",
    cancel: "Cancel",
  },
  removeAddress: {
    title: "Remove Account",
    description: "Enter the account address to remove it from external KYC.",
    input: {
      label: "Account Address",
      placeholder: "0.0.123456",
    },
    remove: "Remove",
    cancel: "Cancel",
  },
  checkAddress: {
    title: "Check Account",
    description: "Enter the account address to check it in external KYC.",
    input: {
      label: "Account Address",
      placeholder: "0.0.123456",
    },
    check: "Check",
    cancel: "Cancel",
  },
};
