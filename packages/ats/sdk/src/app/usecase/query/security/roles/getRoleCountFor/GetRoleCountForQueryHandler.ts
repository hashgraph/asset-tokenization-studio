// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetRoleCountForQuery, GetRoleCountForQueryResponse } from "./GetRoleCountForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetRoleCountForQueryError } from "./error/GetRoleCountForQueryError";

@QueryHandler(GetRoleCountForQuery)
export class GetRoleCountForQueryHandler implements IQueryHandler<GetRoleCountForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetRoleCountForQuery): Promise<GetRoleCountForQueryResponse> {
    try {
      const { targetId, securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getRoleCountFor(securityEvmAddress, targetEvmAddress);

      return new GetRoleCountForQueryResponse(res);
    } catch (error) {
      throw new GetRoleCountForQueryError(error as Error);
    }
  }
}
