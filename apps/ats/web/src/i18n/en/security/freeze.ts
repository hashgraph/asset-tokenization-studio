// SPDX-License-Identifier: Apache-2.0

export default {
  header: {
    title: "Digital security freeze",
  },
  title: "Freeze securities",
  subtitle: "Enter the information to freeze the securities",
  input: {
    amountFreeze: {
      label: "Amount to freeze",
      placeholder: "Enter the amount to freeze",
    },
    amountUnfreeze: {
      label: "Amount to Unfreeze",
      placeholder: "Enter the amount to unfreeze",
    },
    destination: {
      label: "Destination account",
      placeholder: "Choose destination account",
    },
    isUnfreeze: {
      label: "Unfreeze",
      tooltip: "Choose to unfreeze the security",
    },
  },
  list: {
    details: {
      label: "Details",
    },
  },
  messages: {
    success: "Success: ",
    descriptionSuccess: "The freeze operation has been executed successfully",
    error: "Error: ",
    descriptionFailed: "The freeze operation has failed",
  },
};
