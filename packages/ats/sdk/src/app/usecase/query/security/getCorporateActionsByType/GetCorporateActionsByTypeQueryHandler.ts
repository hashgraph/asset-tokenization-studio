// SPDX-License-Identifier: Apache-2.0

import {
  GetCorporateActionsByTypeQuery,
  GetCorporateActionsByTypeQueryResponse,
} from "./GetCorporateActionsByTypeQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetCorporateActionsByTypeQueryError } from "./error/GetCorporateActionsByTypeQueryError";

@QueryHandler(GetCorporateActionsByTypeQuery)
export class GetCorporateActionsByTypeQueryHandler implements IQueryHandler<GetCorporateActionsByTypeQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCorporateActionsByTypeQuery): Promise<GetCorporateActionsByTypeQueryResponse> {
    try {
      const { securityId, actionType, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getCorporateActionsByType(securityEvmAddress, actionType, start, end);

      return new GetCorporateActionsByTypeQueryResponse(res);
    } catch (error) {
      throw new GetCorporateActionsByTypeQueryError(error as Error);
    }
  }
}
