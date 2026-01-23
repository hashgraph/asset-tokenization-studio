// SPDX-License-Identifier: Apache-2.0

export default {
  tabs: {
    create: "Create",
    list: "List",
    manage: "Manage",
  },
  list: {
    clearingOperationsTransfer: "Clearing Operations Transfer",
    clearingOperationsRedeem: "Clearing Operations Redeem",
    clearingOperationsHold: "Clearing Operations Hold",
    add: "Add",
    transfer: "Transfer",
    redeem: "Redeem",
    hold: "Hold",
    id: "ID",
    amount: "Amount",
    expirationDate: "Expiration Date",
    holdExpirationDate: "Hold Expiration Date",
    escrowAddress: "Escrow Address",
    sourceAccount: "Source Account",
    targetId: "Target ID",
    clearingOperationType: "Clearing Operation Type",
    actions: "Actions",
    reclaim: "Reclaim",
  },
  create: {
    title: "Create Clearing Operation",
    form: {
      operationType: {
        label: "Operation Type",
        placeholder: "Select a operation type",
      },
      amount: {
        label: "Amount",
        placeholder: "0",
      },
      expirationDate: {
        label: "Expiration Date",
        placeholder: "Expiration Date",
      },
      holdExpirationDate: {
        label: "Hold Expiration Date",
        placeholder: "Hold Expiration Date",
      },
      targetId: {
        label: "Target ID",
        placeholder: "0.0.1234567",
      },
      escrowAccount: {
        label: "Escrow Account",
        placeholder: "0.0.1234567",
      },
      sourceId: {
        label: "Source ID",
        placeholder: "0.0.1234567",
      },
    },
  },
  manage: {
    title: "Manage Clearing Operation",
    form: {
      operationType: {
        label: "Operation Type",
        placeholder: "Select a operation type",
      },
      clearingOperationId: {
        label: "Clearing Operation ID",
        placeholder: "1",
      },
      clearingOperationType: {
        label: "Clearing Operation Type",
        placeholder: "Select clearing operation type",
      },
      sourceId: {
        label: "Source ID",
        placeholder: "0.0.1234567",
      },
    },
    execute: "Execute",
  },
  actions: {
    confirmReclaimPopUp: {
      title: "Reclaim",
      description: "Are you sure you want to reclaim the clearing operation?",
      confirmText: "Confirm",
      cancelText: "Cancel",
    },
    confirmCreate: {
      title: "Confirmation",
      description: "Are you sure you want to create this clearing operation?",
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
  messages: {
    success: "Success: ",
    descriptionSuccess: "The Clearing Operation has been executed successfully",
    error: "Error: ",
    descriptionFailed: "The Clearing Operation has failed",
  },
};
