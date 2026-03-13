// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetDividendForQuery, GetDividendForQueryResponse } from "./GetDividendForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetDividendForQueryError } from "./error/GetDividendForQueryError";

@QueryHandler(GetDividendForQuery)
export class GetDividendForQueryHandler implements IQueryHandler<GetDividendForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetDividendForQuery): Promise<GetDividendForQueryResponse> {
    try {
      const { targetId, securityId, dividendId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getDividendFor(securityEvmAddress, targetEvmAddress, dividendId);

      return new GetDividendForQueryResponse(res.tokenBalance, res.decimals, res.isDisabled);
    } catch (error) {
      throw new GetDividendForQueryError(error as Error);
    }
  }
}
