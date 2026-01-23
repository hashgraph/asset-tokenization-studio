// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetControlListCountQuery, GetControlListCountQueryResponse } from "./GetControlListCountQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetControlListCountQueryError } from "./error/GetControlListCountQueryError";

@QueryHandler(GetControlListCountQuery)
export class GetControlListCountQueryHandler implements IQueryHandler<GetControlListCountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetControlListCountQuery): Promise<GetControlListCountQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getControlListCount(securityEvmAddress);

      return new GetControlListCountQueryResponse(res);
    } catch (error) {
      throw new GetControlListCountQueryError(error as Error);
    }
  }
}
