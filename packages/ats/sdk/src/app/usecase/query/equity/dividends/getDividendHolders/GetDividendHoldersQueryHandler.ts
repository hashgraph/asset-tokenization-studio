// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetDividendHoldersQueryError } from "./error/GetDividendHoldersQueryError";
import { GetDividendHoldersQuery, GetDividendHoldersQueryResponse } from "./GetDividendHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetDividendHoldersQuery)
export class GetDividendHoldersQueryHandler implements IQueryHandler<GetDividendHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetDividendHoldersQuery): Promise<GetDividendHoldersQueryResponse> {
    try {
      const { securityId, dividendId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getDividendHolders(securityEvmAddress, dividendId, start, end);

      const updatedRes = await Promise.all(
        res.map(async (address) => (await this.accountService.getAccountInfo(address)).id.toString()),
      );

      return new GetDividendHoldersQueryResponse(updatedRes);
    } catch (error) {
      throw new GetDividendHoldersQueryError(error as Error);
    }
  }
}
