// SPDX-License-Identifier: Apache-2.0

import { IsDeactivatedQuery, IsDeactivatedQueryResponse } from "./IsDeactivatedQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IsDeactivatedQueryError } from "./error/IsDeactivatedQueryError";

@QueryHandler(IsDeactivatedQuery)
export class IsDeactivatedQueryHandler implements IQueryHandler<IsDeactivatedQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: IsDeactivatedQuery): Promise<IsDeactivatedQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.isDeactivated(securityEvmAddress);
      return new IsDeactivatedQueryResponse(res);
    } catch (error) {
      throw new IsDeactivatedQueryError(error as Error);
    }
  }
}
