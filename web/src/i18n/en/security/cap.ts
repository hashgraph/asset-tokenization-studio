export default {
  form: {
    title: "Set Max Supply",
    description: "Set the maximum supply of the security.",
    securityId: {
      label: "Security ID",
      placeholder: "0.0.12345",
    },
    maxSupply: {
      label: "Max Supply",
      placeholder: "Max Supply",
    },
  },
  actions: {
    confirmPopUp: {
      title: "Confirm",
      description:
        "Are you sure you want to set the max supply of the security?",
      confirmText: "Confirm",
      cancelText: "Cancel",
    },
  },
  messages: {
    success: "Success: ",
    descriptionSuccess:
      "The set max supply operation has been executed successfully",
    error: "Error: ",
    descriptionFailed: "The set max supply operation has failed",
  },
};
