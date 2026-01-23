// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetIssuerListCountQuery, GetIssuerListCountQueryResponse } from "./GetIssuerListCountQuery";
import { GetIssuerListCountQueryError } from "./error/GetIssuerListCountQueryError";

@QueryHandler(GetIssuerListCountQuery)
export class GetIssuerListCountQueryHandler implements IQueryHandler<GetIssuerListCountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetIssuerListCountQuery): Promise<GetIssuerListCountQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getIssuerListCount(securityEvmAddress);

      return new GetIssuerListCountQueryResponse(res);
    } catch (error) {
      throw new GetIssuerListCountQueryError(error as Error);
    }
  }
}
