// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetAmortizationsForQuery, GetAmortizationsForQueryResponse } from "./GetAmortizationsForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetAmortizationsForQueryError } from "./error/GetAmortizationsForQueryError";

@QueryHandler(GetAmortizationsForQuery)
export class GetAmortizationsForQueryHandler implements IQueryHandler<GetAmortizationsForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetAmortizationsForQuery): Promise<GetAmortizationsForQueryResponse> {
    try {
      const { securityId, amortizationId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getAmortizationsFor(securityEvmAddress, amortizationId, start, end);

      return new GetAmortizationsForQueryResponse(res);
    } catch (error) {
      throw new GetAmortizationsForQueryError(error as Error);
    }
  }
}
