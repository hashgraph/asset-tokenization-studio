// SPDX-License-Identifier: Apache-2.0

export default {
  list: {
    header: {
      createNewExternalPause: "Create new external pause",
      title: "External Pause list",
    },
    table: {
      address: "Address",
      state: "State",
      actions: "Actions",
      activated: "Activated",
      deactivated: "Deactivated",
      empty: "No results found",
    },
    modal: {
      removeExternalPausePopUp: {
        title: "Remove External Pause",
        description: "Are you sure you want to remove this external pause? This action cannot be undone.",
        confirmText: "Yes, remove it",
        cancelText: "Cancel",
      },
    },
    messages: {
      addExternalPause: {
        success: "Success: ",
        descriptionSuccess: "The external pause has been added",
        error: "Failed: ",
        descriptionFailed: "There was an error adding the external pause. Please try again",
      },
      removeExternalPause: {
        success: "Success: ",
        descriptionSuccess: "The external pause has been removed",
        error: "Deletion failed: ",
        descriptionFailed: "There was an error deleting the external pause. Please try again",
      },
      changeState: {
        success: "Success: ",
        descriptionSuccess: "The external pause state has been changed",
        error: "State change failed: ",
        descriptionFailed: "There was an error updating the external pause state. Please try again",
      },
      createMock: {
        success: "Success: ",
        descriptionSuccess: "The external pause has been created",
        error: "State change failed: ",
        descriptionFailed: "There was an error creating the external pause. Please try again",
      },
    },
  },
  add: {
    title: "Add External Pause",
    subtitle: "Add an existing external pause with its ID",
    mandatoryFields: "*Mandatory fields",
    input: {
      id: {
        label: "External Pause ID*",
        placeholder: "0.0.12345",
      },
    },
    create: "Add external pause",
    cancel: "Cancel",
  },
  create: {
    title: "External Pause creation",
    subtitle: "Create a new external pause to be used for securities",
    mandatoryFields: "*Mandatory fields",
    input: {
      isActivated: {
        label: "Activated*",
      },
    },
    create: "Create external pause",
    cancel: "Cancel",
  },
  messages: {
    addExternalPause: {
      success: "Success: ",
      descriptionSuccess: "The external pause has been added",
      error: "Failed: ",
      descriptionFailed: "There was an error adding the external pause. Please try again",
    },
  },
};
