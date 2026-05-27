// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetCustomDataQuery, GetCustomDataQueryResponse } from "./GetCustomDataQuery";
import { GetCustomDataQueryError } from "./error/GetCustomDataQueryError";

@QueryHandler(GetCustomDataQuery)
export class GetCustomDataQueryHandler implements IQueryHandler<GetCustomDataQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCustomDataQuery): Promise<GetCustomDataQueryResponse> {
    try {
      const { securityId, key } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getCustomData(securityEvmAddress, key);

      return new GetCustomDataQueryResponse(res);
    } catch (error) {
      throw new GetCustomDataQueryError(error as Error);
    }
  }
}
