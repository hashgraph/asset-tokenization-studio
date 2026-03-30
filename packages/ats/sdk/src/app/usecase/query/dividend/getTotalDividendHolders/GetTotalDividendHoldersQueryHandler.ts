// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalDividendHoldersQueryError } from "./error/GetTotalDividendHoldersQueryError";
import { GetTotalDividendHoldersQuery, GetTotalDividendHoldersQueryResponse } from "./GetTotalDividendHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetTotalDividendHoldersQuery)
export class GetTotalDividendHoldersQueryHandler implements IQueryHandler<GetTotalDividendHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetTotalDividendHoldersQuery): Promise<GetTotalDividendHoldersQueryResponse> {
    try {
      const { securityId, dividendId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getTotalDividendHolders(securityEvmAddress, dividendId);

      return new GetTotalDividendHoldersQueryResponse(res);
    } catch (error) {
      throw new GetTotalDividendHoldersQueryError(error as Error);
    }
  }
}
