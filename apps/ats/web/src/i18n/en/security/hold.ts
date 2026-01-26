// SPDX-License-Identifier: Apache-2.0

export default {
  tabs: {
    list: "List",
    create: "Create",
    manage: "Manage",
  },
  list: {
    id: "Hold ID",
    originalAccount: "Original Account",
    destinationAccount: "Destination Account",
    escrowAccount: "Escrow Account",
    expirationDate: "Expiration Date",
    amount: "Amount",
    noHolds: "No holds found",
  },
  form: {
    title: "Title",
    description: "Description",
    originalAccount: {
      label: "Original Account",
      placeholder: "0.0.1234567",
    },
    targetId: {
      label: "Target ID",
      placeholder: "0.0.1234567",
    },
    amount: {
      label: "Amount",
      placeholder: "Amount",
    },
    destinationAccount: {
      label: "Destination Account",
      placeholder: "0.0.1234567",
    },
    holdId: {
      label: "Hold ID",
      placeholder: "1",
    },
  },
  actions: {
    confirmReclaimPopUp: {
      title: "Reclaim",
      description: "Are you sure you want to reclaim the hold?",
      confirmText: "Confirm",
      cancelText: "Cancel",
    },
    confirmHoldPopUp: {
      title: "New hold",
      description: "Are you sure you want to create a new hold?",
      confirmText: "Confirm",
      cancelText: "Cancel",
    },
    confirmManage: {
      title: "Confirmation",
      description: "Are you sure you want to proceed with this operation?",
      confirmText: "Confirm",
      cancelText: "Cancel",
    },
  },
  create: {
    title: "Create hold",
    description: "Fill the form to create a new hold",
    originalAccount: {
      label: "Original Account",
      placeholder: "0.0.1234567",
    },
    destinationAccount: {
      label: "Destination Account",
      placeholder: "0.0.1234567",
    },
    escrowAccount: {
      label: "Escrow Account",
      placeholder: "0.0.1234567",
    },
    expirationDate: {
      label: "Expiration Date",
      placeholder: "Select expiration date",
    },
    amount: {
      label: "Amount",
      placeholder: "Amount",
    },
  },
  manage: {
    release: "Release",
    execute: "Execute",
  },
  release: {
    title: "Release Hold",
    description: "Fill the form to release a hold",
  },
  execute: {
    title: "Execute Hold",
    description: "Fill the form to execute a hold",
  },
  messages: {
    success: "Success: ",
    descriptionSuccess: "The hold operation has been executed successfully",
    error: "Error: ",
    descriptionFailed: "The hold operation has failed",
  },
};
