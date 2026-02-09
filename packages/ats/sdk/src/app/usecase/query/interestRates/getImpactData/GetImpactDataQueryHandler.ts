// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetImpactDataQuery, GetImpactDataQueryResponse } from "./GetImpactDataQuery";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import GetImpactDataQueryError from "./error/GetImpactDataQueryError";

@QueryHandler(GetImpactDataQuery)
export class GetImpactDataQueryHandler implements IQueryHandler<GetImpactDataQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetImpactDataQuery): Promise<GetImpactDataQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(securityId);

      const [maxDeviationCap, baseLine, maxDeviationFloor, impactDataDecimals, adjustmentPrecision] =
        await this.queryAdapter.getImpactData(securityEvmAddress);

      return Promise.resolve(
        new GetImpactDataQueryResponse(
          maxDeviationCap.toString(),
          baseLine.toString(),
          maxDeviationFloor.toString(),
          impactDataDecimals,
          adjustmentPrecision.toString(),
        ),
      );
    } catch (error) {
      throw new GetImpactDataQueryError(error as Error);
    }
  }
}
