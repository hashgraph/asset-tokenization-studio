// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetActiveAmortizationIdsQuery, GetActiveAmortizationIdsQueryResponse } from "./GetActiveAmortizationIdsQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetActiveAmortizationIdsQueryError } from "./error/GetActiveAmortizationIdsQueryError";

@QueryHandler(GetActiveAmortizationIdsQuery)
export class GetActiveAmortizationIdsQueryHandler implements IQueryHandler<GetActiveAmortizationIdsQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetActiveAmortizationIdsQuery): Promise<GetActiveAmortizationIdsQueryResponse> {
    try {
      const { securityId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getActiveAmortizationIds(securityEvmAddress, start, end);

      return new GetActiveAmortizationIdsQueryResponse(res);
    } catch (error) {
      throw new GetActiveAmortizationIdsQueryError(error as Error);
    }
  }
}
