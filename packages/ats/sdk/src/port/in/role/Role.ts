// SPDX-License-Identifier: Apache-2.0

import NetworkService from "@service/network/NetworkService";
import SecurityService from "@service/security/SecurityService";
import { GrantRoleCommand } from "@command/security/roles/grantRole/GrantRoleCommand";
import { RevokeRoleCommand } from "@command/security/roles/revokeRole/RevokeRoleCommand";
import { GetRoleCountForQuery } from "@query/security/roles/getRoleCountFor/GetRoleCountForQuery";
import { GetRoleMemberCountQuery } from "@query/security/roles/getRoleMemberCount/GetRoleMemberCountQuery";
import { GetRoleMembersQuery } from "@query/security/roles/getRoleMembers/GetRoleMembersQuery";
import { GetRolesForQuery } from "@query/security/roles/getRolesFor/GetRolesForQuery";
import { HasRoleQuery } from "@query/security/roles/hasRole/HasRoleQuery";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { LogError } from "@core/decorator/LogErrorDecorator";
import { QueryBus } from "@core/query/QueryBus";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import GetRoleCountForRequest from "../request/security/roles/GetRoleCountForRequest";
import GetRoleMemberCountRequest from "../request/security/roles/GetRoleMemberCountRequest";
import GetRoleMembersRequest from "../request/security/roles/GetRoleMembersRequest";
import GetRolesForRequest from "../request/security/roles/GetRolesForRequest";
import RoleRequest from "../request/security/roles/RoleRequest";
import ApplyRolesRequest from "../request/security/roles/ApplyRolesRequest";
import { ApplyRolesCommand } from "@command/security/roles/applyRoles/ApplyRolesCommand";

interface IRole {
  hasRole(request: RoleRequest): Promise<boolean>;
  grantRole(request: RoleRequest): Promise<{ payload: boolean; transactionId: string }>;
  revokeRole(request: RoleRequest): Promise<{ payload: boolean; transactionId: string }>;
  getRoleCountFor(request: GetRoleCountForRequest): Promise<number>;
  getRolesFor(request: GetRolesForRequest): Promise<string[]>;
  getRoleMemberCount(request: GetRoleMemberCountRequest): Promise<number>;
  getRoleMembers(request: GetRoleMembersRequest): Promise<string[]>;
  applyRoles(request: ApplyRolesRequest): Promise<{ payload: boolean; transactionId: string }>;
}

class RoleInPort implements IRole {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly securityService: SecurityService = Injectable.resolve(SecurityService),
    private readonly networkService: NetworkService = Injectable.resolve(NetworkService),
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNode: MirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter),
  ) {}

  @LogError
  async hasRole(request: RoleRequest): Promise<boolean> {
    const { securityId, targetId, role } = request;
    ValidatedRequest.handleValidation("RoleRequest", request);
    return (await this.queryBus.execute(new HasRoleQuery(role!, targetId, securityId))).payload;
  }

  @LogError
  async grantRole(request: RoleRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, targetId, role } = request;
    ValidatedRequest.handleValidation("RoleRequest", request);

    return await this.commandBus.execute(new GrantRoleCommand(role!, targetId, securityId));
  }

  @LogError
  async revokeRole(request: RoleRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, targetId, role } = request;
    ValidatedRequest.handleValidation("RoleRequest", request);

    return await this.commandBus.execute(new RevokeRoleCommand(role!, targetId, securityId));
  }

  @LogError
  async getRoleCountFor(request: GetRoleCountForRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetRoleCountForRequest", request);

    return (await this.queryBus.execute(new GetRoleCountForQuery(request.targetId, request.securityId))).payload;
  }

  @LogError
  async getRolesFor(request: GetRolesForRequest): Promise<string[]> {
    ValidatedRequest.handleValidation("GetRolesForRequest", request);

    return (
      await this.queryBus.execute(
        new GetRolesForQuery(request.targetId, request.securityId, request.start, request.end),
      )
    ).payload;
  }

  @LogError
  async getRoleMemberCount(request: GetRoleMemberCountRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetRoleMemberCountRequest", request);

    return (await this.queryBus.execute(new GetRoleMemberCountQuery(request.role!, request.securityId))).payload;
  }

  @LogError
  async getRoleMembers(request: GetRoleMembersRequest): Promise<string[]> {
    ValidatedRequest.handleValidation("GetRoleMembersRequest", request);

    const membersIds: string[] = [];

    const membersEvmAddresses = (
      await this.queryBus.execute(
        new GetRoleMembersQuery(request.role!, request.securityId, request.start, request.end),
      )
    ).payload;

    let mirrorAccount;

    for (let i = 0; i < membersEvmAddresses.length; i++) {
      mirrorAccount = await this.mirrorNode.getAccountInfo(membersEvmAddresses[i]);
      membersIds.push(mirrorAccount.id.toString());
    }

    return membersIds;
  }

  @LogError
  async applyRoles(request: ApplyRolesRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, targetId, roles, actives } = request;
    ValidatedRequest.handleValidation("ApplyRolesRequest", request);

    return await this.commandBus.execute(new ApplyRolesCommand(roles, actives, targetId, securityId));
  }
}

const Role = new RoleInPort();
export default Role;
