// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetRolesForQuery, GetRolesForQueryResponse } from "./GetRolesForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetRolesForQueryError } from "./error/GetRolesForQueryError";

@QueryHandler(GetRolesForQuery)
export class GetRolesForQueryHandler implements IQueryHandler<GetRolesForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetRolesForQuery): Promise<GetRolesForQueryResponse> {
    try {
      const { targetId, securityId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getRolesFor(securityEvmAddress, targetEvmAddress, start, end);

      return new GetRolesForQueryResponse(res);
    } catch (error) {
      throw new GetRolesForQueryError(error as Error);
    }
  }
}
