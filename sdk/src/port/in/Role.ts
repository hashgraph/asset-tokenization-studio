/*
 *
 * Hedera Asset Tokenization Studio SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import NetworkService from '../../app/service/NetworkService.js';
import SecurityService from '../../app/service/SecurityService.js';
import { GrantRoleCommand } from '../../app/usecase/command/security/roles/grantRole/GrantRoleCommand.js';
import { RevokeRoleCommand } from '../../app/usecase/command/security/roles/revokeRole/RevokeRoleCommand.js';
import { GetRoleCountForQuery } from '../../app/usecase/query/security/roles/getRoleCountFor/GetRoleCountForQuery.js';
import { GetRoleMemberCountQuery } from '../../app/usecase/query/security/roles/getRoleMemberCount/GetRoleMemberCountQuery.js';
import { GetRoleMembersQuery } from '../../app/usecase/query/security/roles/getRoleMembers/GetRoleMembersQuery.js';
import { GetRolesForQuery } from '../../app/usecase/query/security/roles/getRolesFor/GetRolesForQuery.js';
import { HasRoleQuery } from '../../app/usecase/query/security/roles/hasRole/HasRoleQuery.js';
import Injectable from '../../core/Injectable.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { lazyInject } from '../../core/decorator/LazyInjectDecorator.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { MirrorNodeAdapter } from '../out/mirror/MirrorNodeAdapter.js';
import { handleValidation } from './Common.js';
import GetRoleCountForRequest from './request/GetRoleCountForRequest.js';
import GetRoleMemberCountRequest from './request/GetRoleMemberCountRequest.js';
import GetRoleMembersRequest from './request/GetRoleMembersRequest.js';
import GetRolesForRequest from './request/GetRolesForRequest.js';
import RoleRequest from './request/RoleRequest.js';
import ApplyRolesRequest from './request/ApplyRolesRequest.js';
import { ApplyRolesCommand } from '../../app/usecase/command/security/roles/applyRoles/ApplyRolesCommand.js';

interface IRole {
  hasRole(request: RoleRequest): Promise<boolean>;
  grantRole(
    request: RoleRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  revokeRole(
    request: RoleRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  getRoleCountFor(request: GetRoleCountForRequest): Promise<number>;
  getRolesFor(request: GetRolesForRequest): Promise<string[]>;
  getRoleMemberCount(request: GetRoleMemberCountRequest): Promise<number>;
  getRoleMembers(request: GetRoleMembersRequest): Promise<string[]>;
  applyRoles(
    request: ApplyRolesRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
}

class RoleInPort implements IRole {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly securityService: SecurityService = Injectable.resolve(
      SecurityService,
    ),
    private readonly networkService: NetworkService = Injectable.resolve(
      NetworkService,
    ),
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNode: MirrorNodeAdapter = Injectable.resolve(
      MirrorNodeAdapter,
    ),
  ) {}

  @LogError
  async hasRole(request: RoleRequest): Promise<boolean> {
    const { securityId, targetId, role } = request;
    handleValidation('RoleRequest', request);
    return (
      await this.queryBus.execute(new HasRoleQuery(role!, targetId, securityId))
    ).payload;
  }

  @LogError
  async grantRole(
    request: RoleRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, targetId, role } = request;
    handleValidation('RoleRequest', request);

    return await this.commandBus.execute(
      new GrantRoleCommand(role!, targetId, securityId),
    );
  }

  @LogError
  async revokeRole(
    request: RoleRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, targetId, role } = request;
    handleValidation('RoleRequest', request);

    return await this.commandBus.execute(
      new RevokeRoleCommand(role!, targetId, securityId),
    );
  }

  @LogError
  async getRoleCountFor(request: GetRoleCountForRequest): Promise<number> {
    handleValidation('GetRoleCountForRequest', request);

    return (
      await this.queryBus.execute(
        new GetRoleCountForQuery(request.targetId, request.securityId),
      )
    ).payload;
  }

  @LogError
  async getRolesFor(request: GetRolesForRequest): Promise<string[]> {
    handleValidation('GetRolesForRequest', request);

    return (
      await this.queryBus.execute(
        new GetRolesForQuery(
          request.targetId,
          request.securityId,
          request.start,
          request.end,
        ),
      )
    ).payload;
  }

  @LogError
  async getRoleMemberCount(
    request: GetRoleMemberCountRequest,
  ): Promise<number> {
    handleValidation('GetRoleMemberCountRequest', request);

    return (
      await this.queryBus.execute(
        new GetRoleMemberCountQuery(request.role!, request.securityId),
      )
    ).payload;
  }

  @LogError
  async getRoleMembers(request: GetRoleMembersRequest): Promise<string[]> {
    handleValidation('GetRoleMembersRequest', request);

    const membersIds: string[] = [];

    const membersEvmAddresses = (
      await this.queryBus.execute(
        new GetRoleMembersQuery(
          request.role!,
          request.securityId,
          request.start,
          request.end,
        ),
      )
    ).payload;

    let mirrorAccount;

    for (let i = 0; i < membersEvmAddresses.length; i++) {
      mirrorAccount = await this.mirrorNode.getAccountInfo(
        membersEvmAddresses[i],
      );
      membersIds.push(mirrorAccount.id.toString());
    }

    return membersIds;
  }

  @LogError
  async applyRoles(
    request: ApplyRolesRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, targetId, roles, actives } = request;
    handleValidation('ApplyRolesRequest', request);

    return await this.commandBus.execute(
      new ApplyRolesCommand(roles, actives, targetId, securityId),
    );
  }
}

const Role = new RoleInPort();
export default Role;
