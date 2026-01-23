// SPDX-License-Identifier: Apache-2.0

export default {
  title: "Add digital security",
  subtitle: "Add an existing security with its ID or DLT address",
  addDigitalSecurity: "Add digital security",

  form: {
    mandatoryFields: "*Mandatory fields",
    input: {
      address: {
        label: "ID or DLT address*",
        placeholder: "0.0.12345",
      },
    },
  },

  messages: {
    succes: "Success: ",
    additionSucces: "Add digital security was successful: ",
    error: "Error: ",
    additionFailed: "Add digital security failed",
    alredyAdded: "This security is already added",
    addedToAdmin: "Found admin roles. Security was added to Admin panel",
  },
};
