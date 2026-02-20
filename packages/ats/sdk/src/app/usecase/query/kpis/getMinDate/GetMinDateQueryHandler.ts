// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetMinDateQuery, GetMinDateQueryResponse } from "./GetMinDateQuery";
import { GetMinDateQueryError } from "./error/GetMinDateQueryError";

@QueryHandler(GetMinDateQuery)
export class GetMinDateQueryHandler implements IQueryHandler<GetMinDateQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetMinDateQuery): Promise<GetMinDateQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getMinDate(securityEvmAddress);

      return new GetMinDateQueryResponse(res);
    } catch (error) {
      throw new GetMinDateQueryError(error as Error);
    }
  }
}
