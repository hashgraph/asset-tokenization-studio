// SPDX-License-Identifier: Apache-2.0

import { IsPausedQuery, IsPausedQueryResponse } from "./IsPausedQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IsPausedQueryError } from "./error/IsPausedQueryError";

@QueryHandler(IsPausedQuery)
export class IsPausedQueryHandler implements IQueryHandler<IsPausedQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: IsPausedQuery): Promise<IsPausedQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.isPaused(securityEvmAddress);
      return new IsPausedQueryResponse(res);
    } catch (error) {
      throw new IsPausedQueryError(error as Error);
    }
  }
}
