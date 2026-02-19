// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetRateQuery, GetRateQueryResponse } from "./GetRateQuery";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetRateQueryError } from "./error/GetRateQueryError";

@QueryHandler(GetRateQuery)
export class GetRateQueryHandler implements IQueryHandler<GetRateQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetRateQuery): Promise<GetRateQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(securityId);

      const [rate, decimals] = await this.queryAdapter.getRate(securityEvmAddress);

      return Promise.resolve(new GetRateQueryResponse(rate, decimals));
    } catch (error) {
      throw new GetRateQueryError(error as Error);
    }
  }
}
