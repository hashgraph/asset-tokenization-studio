// SPDX-License-Identifier: Apache-2.0

export default {
  tabs: {
    edit: "Edit roles",
    search: "Search by role",
  },
  edit: {
    title: "Account",
    subtitle: "Add the ID account to manage its roles",
    currentRoles: "Current roles",
    rolesDefinitions: "Roles definitions",
    selectAllRoles: "Select all roles",
    rolesSelected: "roles selected",
    inputs: {
      search: {
        placeholder: "0.0.12345",
        button: "Search ID",
      },
      apply: {
        button: "Apply changes",
      },
    },
  },
  messages: {
    success: "Success: ",
    grantRoleSuccessful: "Grant role was successful",
    revokeRoleSuccessful: "Revoke role was successful",
    applyRoleSuccessful: "The role change has been completed.",
    error: "Error: ",
    grantRoleFailed: "Grant role failed",
    revokeRoleFailed: "Revoke role failed",
    applyRoleFailed: "role change failed",
  },
  search: {
    title: "Search by role",
    subtitle: "Pick a role to see its linked accounts",
    role: "{{ role }} in current accounts",
    noRoles: "No accounts founded",
    inputs: {
      select: {
        label: "Select a role to show",
        placeholder: "Select role",
        button: "Seach",
      },
    },
  },
};
