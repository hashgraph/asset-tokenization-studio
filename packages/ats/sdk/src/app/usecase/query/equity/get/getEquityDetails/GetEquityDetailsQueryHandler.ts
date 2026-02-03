// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetEquityDetailsQuery, GetEquityDetailsQueryResponse } from "./GetEquityDetailsQuery";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { EquityDetails } from "@domain/context/equity/EquityDetails";
import { GetEquityDetailsQueryError } from "./error/GetEquityDetailsQueryError";

@QueryHandler(GetEquityDetailsQuery)
export class GetEquityDetailsQueryHandler implements IQueryHandler<GetEquityDetailsQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetEquityDetailsQuery): Promise<GetEquityDetailsQueryResponse> {
    try {
      const { equityId } = query;

      const equityEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(equityId);

      const equity: EquityDetails = await this.queryAdapter.getEquityDetails(equityEvmAddress);

      return Promise.resolve(new GetEquityDetailsQueryResponse(equity));
    } catch (error) {
      throw new GetEquityDetailsQueryError(error as Error);
    }
  }
}
