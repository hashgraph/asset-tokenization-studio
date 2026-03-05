// SPDX-License-Identifier: Apache-2.0

import { GetCorporateActionQuery, GetCorporateActionQueryResponse } from "./GetCorporateActionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetCorporateActionQueryError } from "./error/GetCorporateActionQueryError";

@QueryHandler(GetCorporateActionQuery)
export class GetCorporateActionQueryHandler implements IQueryHandler<GetCorporateActionQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCorporateActionQuery): Promise<GetCorporateActionQueryResponse> {
    try {
      const { securityId, corporateActionId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getCorporateAction(securityEvmAddress, corporateActionId);

      return new GetCorporateActionQueryResponse(res);
    } catch (error) {
      throw new GetCorporateActionQueryError(error as Error);
    }
  }
}
