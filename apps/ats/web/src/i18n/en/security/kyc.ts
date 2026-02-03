// SPDX-License-Identifier: Apache-2.0

export default {
  list: {
    title: "KYC List",
    add: "Add",
  },
  table: {
    fields: {
      accountId: "Account ID",
      issuerId: "Issuer ID",
      validFrom: "Valid From",
      validTo: "Valid To",
      vcId: "VC ID",
      status: "Status",
      actions: "Actions",
      revoke: "Remove",
    },
  },
  create: {
    title: "Add KYC",
    description: "",
    form: {
      account: {
        label: "Account ID",
        placeholder: "0.0.1234567",
      },
      vc: {
        label: "VC File",
        placeholder: "Upload VC File",
      },
    },
  },
  revoke: {
    title: "Remove Account",
    description: "Are you sure you want to remove this account?",
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
