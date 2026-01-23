// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { HasRoleQueryHandler } from "@query/security/roles/hasRole/HasRoleQueryHandler";
import { GetRoleCountForQueryHandler } from "@query/security/roles/getRoleCountFor/GetRoleCountForQueryHandler";
import { GetRolesForQueryHandler } from "@query/security/roles/getRolesFor/GetRolesForQueryHandler";
import { RevokeRoleCommandHandler } from "@command/security/roles/revokeRole/RevokeRoleCommandHandler";
import { ApplyRolesCommandHandler } from "@command/security/roles/applyRoles/ApplyRolesCommandHandler";
import { GrantRoleCommandHandler } from "@command/security/roles/grantRole/GrantRoleCommandHandler";
import { GetRoleMemberCountQueryHandler } from "@query/security/roles/getRoleMemberCount/GetRoleMemberCountQueryHandler";
import { GetRoleMembersQueryHandler } from "@query/security/roles/getRoleMembers/GetRoleMembersQueryHandler";

export const COMMAND_HANDLERS_RBAC = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: GrantRoleCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ApplyRolesCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: RevokeRoleCommandHandler,
  },
];

export const QUERY_HANDLERS_RBAC = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: HasRoleQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRoleCountForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRolesForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRoleMemberCountQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetRoleMembersQueryHandler,
  },
];
