// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetDividendQuery, GetDividendQueryResponse } from "./GetDividendQuery";
import ContractService from "@service/contract/ContractService";
import { GetDividendQueryError } from "./error/GetDividendQueryError";

@QueryHandler(GetDividendQuery)
export class GetDividendQueryHandler implements IQueryHandler<GetDividendQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetDividendQuery): Promise<GetDividendQueryResponse> {
    try {
      const { securityId, dividendId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getDividend(securityEvmAddress, dividendId);

      return Promise.resolve(new GetDividendQueryResponse(res));
    } catch (error) {
      throw new GetDividendQueryError(error as Error);
    }
  }
}
