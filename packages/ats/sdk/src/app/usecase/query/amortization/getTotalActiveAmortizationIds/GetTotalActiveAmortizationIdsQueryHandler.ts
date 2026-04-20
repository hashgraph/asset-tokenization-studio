// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import {
  GetTotalActiveAmortizationIdsQuery,
  GetTotalActiveAmortizationIdsQueryResponse,
} from "./GetTotalActiveAmortizationIdsQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetTotalActiveAmortizationIdsQueryError } from "./error/GetTotalActiveAmortizationIdsQueryError";

@QueryHandler(GetTotalActiveAmortizationIdsQuery)
export class GetTotalActiveAmortizationIdsQueryHandler implements IQueryHandler<GetTotalActiveAmortizationIdsQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetTotalActiveAmortizationIdsQuery): Promise<GetTotalActiveAmortizationIdsQueryResponse> {
    const { securityId } = query;
    try {
      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getTotalActiveAmortizationIds(securityEvmAddress);

      return new GetTotalActiveAmortizationIdsQueryResponse(res);
    } catch (error) {
      throw new GetTotalActiveAmortizationIdsQueryError(error as Error);
    }
  }
}
