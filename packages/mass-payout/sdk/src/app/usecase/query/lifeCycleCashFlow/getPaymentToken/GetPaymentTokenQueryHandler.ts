// SPDX-License-Identifier: Apache-2.0

import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { GetPaymentTokenQuery, GetPaymentTokenQueryResponse } from "./GetPaymentTokenQuery";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import { GetPaymentTokenQueryError } from "./error/GetPaymentTokenQueryError";

@QueryHandler(GetPaymentTokenQuery)
export class GetPaymentTokenQueryHandler implements IQueryHandler<GetPaymentTokenQuery> {
  constructor(
    private readonly queryAdapter: RPCQueryAdapter,
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetPaymentTokenQuery): Promise<GetPaymentTokenQueryResponse> {
    try {
      const { lifeCycleCashFlowId } = query;

      const lifeCycleCashFlowAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);

      const res = await this.queryAdapter.getPaymentToken(lifeCycleCashFlowAddress);
      return new GetPaymentTokenQueryResponse(res);
    } catch (error) {
      throw new GetPaymentTokenQueryError(error as Error);
    }
  }
}
