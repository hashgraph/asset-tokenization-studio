// SPDX-License-Identifier: Apache-2.0

export default {
  title: "Locker",
  search: {
    title: "Display Locks",
    description: "Add the ID account to preview its locks",
    search: "Search",
  },
  list: {
    lockId: "Lock ID",
    amount: "Amount",
    expirationDate: "Expiration Date",
    release: "Release",
    noLocks: "No locks found",
  },
  form: {
    expirationDate: {
      label: "Expiration date",
      placeholder: "Select expiration date",
    },
    targetId: {
      label: "Target ID",
      placeholder: "0.0.12345",
    },
    amount: {
      label: "Amount",
      placeholder: "Amount",
    },
  },
  actions: {
    lock: "Lock",
  },
  release: {
    confirmPopUp: {
      title: "Release locker",
      description: "Are you sure you want to release this locker?",
      confirmText: "Confirm",
      cancelText: "Cancel",
    },
    messages: {
      success: "Success: ",
      descriptionSuccess: "The release operation has been executed successfully",
      error: "Error: ",
      descriptionFailed: "The release operation has failed",
    },
  },
  messages: {
    success: "Success: ",
    descriptionSuccess: "The lock operation has been executed successfully",
    error: "Error: ",
    descriptionFailed: "The lock operation has failed",
  },
};
