// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetPrincipalForQuery, GetPrincipalForQueryResponse } from "./GetPrincipalForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { GetPrincipalForQueryError } from "./error/GetPrincipalForQueryError";

@QueryHandler(GetPrincipalForQuery)
export class GetPrincipalForQueryHandler implements IQueryHandler<GetPrincipalForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetPrincipalForQuery): Promise<GetPrincipalForQueryResponse> {
    try {
      const { targetId, securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getPrincipalFor(securityEvmAddress, targetEvmAddress);

      return new GetPrincipalForQueryResponse(res.numerator, res.denominator);
    } catch (error) {
      throw new GetPrincipalForQueryError(error as Error);
    }
  }
}
