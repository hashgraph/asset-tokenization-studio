// SPDX-License-Identifier: Apache-2.0

import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { GetPaymentTokenDecimalsQuery, GetPaymentTokenDecimalsQueryResponse } from "./GetPaymentTokenDecimalsQuery";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import { GetPaymentTokenDecimalsQueryError } from "./error/GetPaymentTokenDecimalsQueryError";

@QueryHandler(GetPaymentTokenDecimalsQuery)
export class GetPaymentTokenDecimalsQueryHandler implements IQueryHandler<GetPaymentTokenDecimalsQuery> {
  constructor(
    private readonly queryAdapter: RPCQueryAdapter,
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetPaymentTokenDecimalsQuery): Promise<GetPaymentTokenDecimalsQueryResponse> {
    try {
      const { lifeCycleCashFlowId } = query;

      const lifeCycleCashFlowAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);

      const res = await this.queryAdapter.getPaymentTokenDecimals(lifeCycleCashFlowAddress);
      return new GetPaymentTokenDecimalsQueryResponse(res);
    } catch (error) {
      throw new GetPaymentTokenDecimalsQueryError(error as Error);
    }
  }
}
