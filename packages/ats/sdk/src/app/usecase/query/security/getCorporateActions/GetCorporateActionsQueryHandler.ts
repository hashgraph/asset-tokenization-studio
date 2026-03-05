// SPDX-License-Identifier: Apache-2.0

import { GetCorporateActionsQuery, GetCorporateActionsQueryResponse } from "./GetCorporateActionsQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetCorporateActionsQueryError } from "./error/GetCorporateActionsQueryError";

@QueryHandler(GetCorporateActionsQuery)
export class GetCorporateActionsQueryHandler implements IQueryHandler<GetCorporateActionsQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCorporateActionsQuery): Promise<GetCorporateActionsQueryResponse> {
    try {
      const { securityId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getCorporateActions(securityEvmAddress, start, end);

      return new GetCorporateActionsQueryResponse(res);
    } catch (error) {
      throw new GetCorporateActionsQueryError(error as Error);
    }
  }
}
