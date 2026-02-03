// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import {
  GetScheduledBalanceAdjustmentQuery,
  GetScheduledBalanceAdjustmentQueryResponse,
} from "./GetScheduledBalanceAdjustmentQuery";
import { GetScheduledBalanceAdjustmentQueryError } from "./error/GetScheduledBalanceAdjustmentQueryError";

@QueryHandler(GetScheduledBalanceAdjustmentQuery)
export class GetScheduledBalanceAdjustmentQueryHandler implements IQueryHandler<GetScheduledBalanceAdjustmentQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetScheduledBalanceAdjustmentQuery): Promise<GetScheduledBalanceAdjustmentQueryResponse> {
    try {
      const { securityId, balanceAdjustmentId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getScheduledBalanceAdjustment(securityEvmAddress, balanceAdjustmentId);

      return Promise.resolve(new GetScheduledBalanceAdjustmentQueryResponse(res));
    } catch (error) {
      throw new GetScheduledBalanceAdjustmentQueryError(error as Error);
    }
  }
}
