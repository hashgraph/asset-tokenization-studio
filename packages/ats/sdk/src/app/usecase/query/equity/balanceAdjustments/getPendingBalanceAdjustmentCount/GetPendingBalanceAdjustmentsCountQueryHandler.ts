// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  GetPendingBalanceAdjustmentCountQuery,
  GetPendingBalanceAdjustmentCountQueryResponse,
} from "./GetPendingBalanceAdjustmentsCountQuery";
import { GetPendingBalanceAdjustmentsCountQueryError } from "./error/GetPendingBalanceAdjustmentsCountQueryError";

@QueryHandler(GetPendingBalanceAdjustmentCountQuery)
export class GetPendingBalanceAdjustmentCountQueryHandler implements IQueryHandler<GetPendingBalanceAdjustmentCountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetPendingBalanceAdjustmentCountQuery): Promise<GetPendingBalanceAdjustmentCountQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getPendingBalanceAdjustmentCount(securityEvmAddress);

      return new GetPendingBalanceAdjustmentCountQueryResponse(res);
    } catch (error) {
      throw new GetPendingBalanceAdjustmentsCountQueryError(error as Error);
    }
  }
}
