// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetDividendAmountForQuery, GetDividendAmountForQueryResponse } from "./GetDividendAmountForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { GetDividendAmountForQueryError } from "./error/GetDividendAmountForQueryError";

@QueryHandler(GetDividendAmountForQuery)
export class GetDividendAmountForQueryHandler implements IQueryHandler<GetDividendAmountForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetDividendAmountForQuery): Promise<GetDividendAmountForQueryResponse> {
    try {
      const { targetId, securityId, dividendId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getDividendAmountFor(securityEvmAddress, targetEvmAddress, dividendId);

      return new GetDividendAmountForQueryResponse(res.numerator, res.denominator, res.recordDateReached);
    } catch (error) {
      throw new GetDividendAmountForQueryError(error as Error);
    }
  }
}
