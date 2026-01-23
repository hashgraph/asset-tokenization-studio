// SPDX-License-Identifier: Apache-2.0

import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { IsPausedQuery, IsPausedQueryResponse } from "./IsPausedQuery";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import { IsPausedQueryError } from "./error/IsPausedQueryError";

@QueryHandler(IsPausedQuery)
export class IsPausedQueryHandler implements IQueryHandler<IsPausedQuery> {
  constructor(
    private readonly queryAdapter: RPCQueryAdapter,
    private readonly contractService: ContractService,
  ) {}

  async execute(query: IsPausedQuery): Promise<IsPausedQueryResponse> {
    try {
      const { lifeCycleCashFlowId } = query;

      const lifeCycleCashFlowAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);

      const res = await this.queryAdapter.isPaused(lifeCycleCashFlowAddress);
      return new IsPausedQueryResponse(res);
    } catch (error) {
      throw new IsPausedQueryError(error as Error);
    }
  }
}
