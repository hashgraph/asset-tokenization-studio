// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  GetScheduledBalanceAdjustmentCountQuery,
  GetScheduledBalanceAdjustmentCountQueryResponse,
} from "./GetScheduledBalanceAdjustmentsCountQuery";
import { GetScheduledBalanceAdjustmentsCountQueryError } from "./error/GetScheduledBalanceAdjustmentsCountQueryError";

@QueryHandler(GetScheduledBalanceAdjustmentCountQuery)
export class GetScheduledBalanceAdjustmentCountQueryHandler
  implements IQueryHandler<GetScheduledBalanceAdjustmentCountQuery>
{
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(
    query: GetScheduledBalanceAdjustmentCountQuery,
  ): Promise<GetScheduledBalanceAdjustmentCountQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getScheduledBalanceAdjustmentCount(securityEvmAddress);

      return new GetScheduledBalanceAdjustmentCountQueryResponse(res);
    } catch (error) {
      throw new GetScheduledBalanceAdjustmentsCountQueryError(error as Error);
    }
  }
}
