// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import {
  ResolveLatestConfigVersionQuery,
  ResolveLatestConfigVersionQueryResponse,
} from "./ResolveLatestConfigVersionQuery";
import { IQueryHandler } from "@core/query/QueryHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { ResolveLatestConfigVersionQueryError } from "./error/ResolveLatestConfigVersionQueryError";

@QueryHandler(ResolveLatestConfigVersionQuery)
export class ResolveLatestConfigVersionQueryHandler implements IQueryHandler<ResolveLatestConfigVersionQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: ResolveLatestConfigVersionQuery): Promise<ResolveLatestConfigVersionQueryResponse> {
    try {
      const resolverEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(query.resolverAddress);

      const latestVersion = await this.queryAdapter.getLatestVersionByConfiguration(
        resolverEvmAddress,
        query.configurationId,
      );

      return Promise.resolve(new ResolveLatestConfigVersionQueryResponse(latestVersion));
    } catch (error) {
      throw new ResolveLatestConfigVersionQueryError(error as Error);
    }
  }
}
