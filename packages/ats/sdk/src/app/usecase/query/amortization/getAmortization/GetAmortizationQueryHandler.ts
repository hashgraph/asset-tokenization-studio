// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetAmortizationQuery, GetAmortizationQueryResponse } from "./GetAmortizationQuery";
import ContractService from "@service/contract/ContractService";
import { GetAmortizationQueryError } from "./error/GetAmortizationQueryError";

@QueryHandler(GetAmortizationQuery)
export class GetAmortizationQueryHandler implements IQueryHandler<GetAmortizationQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetAmortizationQuery): Promise<GetAmortizationQueryResponse> {
    try {
      const { securityId, amortizationId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getAmortization(securityEvmAddress, amortizationId);

      return Promise.resolve(new GetAmortizationQueryResponse(res));
    } catch (error) {
      throw new GetAmortizationQueryError(error as Error);
    }
  }
}
