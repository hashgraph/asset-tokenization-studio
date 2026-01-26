// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetDividendsForQuery, GetDividendsForQueryResponse } from "./GetDividendsForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetDividendsForQueryError } from "./error/GetDividendsForQueryError";

@QueryHandler(GetDividendsForQuery)
export class GetDividendsForQueryHandler implements IQueryHandler<GetDividendsForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetDividendsForQuery): Promise<GetDividendsForQueryResponse> {
    try {
      const { targetId, securityId, dividendId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getDividendsFor(securityEvmAddress, targetEvmAddress, dividendId);

      return new GetDividendsForQueryResponse(res.tokenBalance, res.decimals);
    } catch (error) {
      throw new GetDividendsForQueryError(error as Error);
    }
  }
}
