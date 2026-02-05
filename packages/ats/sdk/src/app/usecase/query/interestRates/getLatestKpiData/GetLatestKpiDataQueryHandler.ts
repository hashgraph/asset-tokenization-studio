// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetLatestKpiDataQueryError } from "./error/GetLatestKpiDataQueryError";
import { GetLatestKpiDataQuery } from "./GetLatestKpiDataQuery";
import { GetLatestKpiDataQueryResponse } from "./GetLatestKpiDataQuery";

@QueryHandler(GetLatestKpiDataQuery)
export class GetLatestKpiDataQueryHandler implements IQueryHandler<GetLatestKpiDataQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetLatestKpiDataQuery): Promise<GetLatestKpiDataQueryResponse> {
    try {
      const { securityId, from, to } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getKpiLatestKpiData(securityEvmAddress, from, to);

      return new GetLatestKpiDataQueryResponse(res.value.toString(), res.exists);
    } catch (error) {
      throw new GetLatestKpiDataQueryError(error as Error);
    }
  }
}
