// SPDX-License-Identifier: Apache-2.0

import { OnchainIDQuery, OnchainIDQueryResponse } from "./OnchainIDQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { OnchainIDQueryError } from "./error/OnchainIDQueryError";

@QueryHandler(OnchainIDQuery)
export class OnchainIDQueryHandler implements IQueryHandler<OnchainIDQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: OnchainIDQuery): Promise<OnchainIDQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.onchainID(securityEvmAddress);

      return new OnchainIDQueryResponse(res);
    } catch (error) {
      throw new OnchainIDQueryError(error as Error);
    }
  }
}
