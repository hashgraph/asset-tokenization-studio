// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { HasRoleQuery, HasRoleQueryResponse } from "./HasRoleQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { HasRoleQueryError } from "./error/HasRoleQueryError";

@QueryHandler(HasRoleQuery)
export class HasRoleQueryHandler implements IQueryHandler<HasRoleQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: HasRoleQuery): Promise<HasRoleQueryResponse> {
    try {
      const { role, targetId, securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.hasRole(securityEvmAddress, targetEvmAddress, role);

      return new HasRoleQueryResponse(res);
    } catch (error) {
      throw new HasRoleQueryError(error as Error);
    }
  }
}
