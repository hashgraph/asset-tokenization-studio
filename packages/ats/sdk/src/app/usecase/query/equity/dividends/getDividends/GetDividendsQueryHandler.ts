// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetDividendsQuery, GetDividendsQueryResponse } from "./GetDividendsQuery";
import ContractService from "@service/contract/ContractService";
import { GetDividendsQueryError } from "./error/GetDividendsQueryError";

@QueryHandler(GetDividendsQuery)
export class GetDividendsQueryHandler implements IQueryHandler<GetDividendsQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetDividendsQuery): Promise<GetDividendsQueryResponse> {
    try {
      const { securityId, dividendId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getDividends(securityEvmAddress, dividendId);

      return Promise.resolve(new GetDividendsQueryResponse(res));
    } catch (error) {
      throw new GetDividendsQueryError(error as Error);
    }
  }
}
