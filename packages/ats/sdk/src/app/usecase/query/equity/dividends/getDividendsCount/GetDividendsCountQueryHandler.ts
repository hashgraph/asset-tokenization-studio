// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetDividendsCountQuery, GetDividendsCountQueryResponse } from "./GetDividendsCountQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetDividendsCountQueryError } from "./error/GetDividendsCountQueryError";

@QueryHandler(GetDividendsCountQuery)
export class GetDividendsCountQueryHandler implements IQueryHandler<GetDividendsCountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetDividendsCountQuery): Promise<GetDividendsCountQueryResponse> {
    const { securityId } = query;
    try {
      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getDividendsCount(securityEvmAddress);

      return new GetDividendsCountQueryResponse(res);
    } catch (error) {
      throw new GetDividendsCountQueryError(error as Error);
    }
  }
}
