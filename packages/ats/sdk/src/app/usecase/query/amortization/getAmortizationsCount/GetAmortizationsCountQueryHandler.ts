// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetAmortizationsCountQuery, GetAmortizationsCountQueryResponse } from "./GetAmortizationsCountQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetAmortizationsCountQueryError } from "./error/GetAmortizationsCountQueryError";

@QueryHandler(GetAmortizationsCountQuery)
export class GetAmortizationsCountQueryHandler implements IQueryHandler<GetAmortizationsCountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetAmortizationsCountQuery): Promise<GetAmortizationsCountQueryResponse> {
    const { securityId } = query;
    try {
      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getAmortizationsCount(securityEvmAddress);

      return new GetAmortizationsCountQueryResponse(res);
    } catch (error) {
      throw new GetAmortizationsCountQueryError(error as Error);
    }
  }
}
