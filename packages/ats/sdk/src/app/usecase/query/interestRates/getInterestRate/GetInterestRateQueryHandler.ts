// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetInterestRateQuery, GetInterestRateQueryResponse } from "./GetInterestRateQuery";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import GetInterestRateQueryError from "./error/GetInterestRateQueryError";

@QueryHandler(GetInterestRateQuery)
export class GetInterestRateQueryHandler implements IQueryHandler<GetInterestRateQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetInterestRateQuery): Promise<GetInterestRateQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(securityId);

      const [maxRate, baseRate, minRate, startPeriod, startRate, missedPenalty, reportPeriod, rateDecimals] =
        await this.queryAdapter.getInterestRate(securityEvmAddress);

      return Promise.resolve(
        new GetInterestRateQueryResponse(
          maxRate.toString(),
          baseRate.toString(),
          minRate.toString(),
          startPeriod.toString(),
          startRate.toString(),
          missedPenalty.toString(),
          reportPeriod.toString(),
          rateDecimals,
        ),
      );
    } catch (error) {
      throw new GetInterestRateQueryError(error as Error);
    }
  }
}
