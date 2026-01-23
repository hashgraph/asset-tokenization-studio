// SPDX-License-Identifier: Apache-2.0

export default {
  form: {
    title: "Edit Configuration",
    subtitle: "Add the new configuration information",
    resolverId: "Resolver ID",
    configId: "Configuration ID",
    configVersion: "Configuration Version",
    clear: "Clear",
    save: "Save",
    validations: {
      configIdWhenResolverId: "The Configuration ID is required when the Resolver ID is provided",
    },
  },
  details: {
    title: "Configuration Details",
    resolverId: "Resolver ID",
    configId: "Configuration ID",
    configVersion: "Configuration Version",
  },
  messages: {
    success: "Success: ",
    updateConfigVersionSuccessful: "Configuration version has been updated successfully",
    updateConfigSuccessful: "Configuration has been updated successfully",
    updateResolverSuccessful: "Resolver has been updated successfully",
    error: "Error: ",
    updateConfigVersionFailed: "Update configuration version failed",
    updateConfigFailed: "Update configuration failed",
    updateResolverFailed: "Update resolver failed",
  },
};
