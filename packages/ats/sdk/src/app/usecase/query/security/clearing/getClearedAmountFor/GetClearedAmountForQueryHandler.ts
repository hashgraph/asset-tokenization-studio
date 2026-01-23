// SPDX-License-Identifier: Apache-2.0

import { GetClearedAmountForQuery, GetClearedAmountForQueryResponse } from "./GetClearedAmountForQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetClearedAmountForQueryError } from "./error/GetClearedAmountForQueryError";

@QueryHandler(GetClearedAmountForQuery)
export class GetClearedAmountForQueryHandler implements IQueryHandler<GetClearedAmountForQuery> {
  constructor(
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetClearedAmountForQuery): Promise<GetClearedAmountForQueryResponse> {
    try {
      const { securityId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getClearedAmountFor(securityEvmAddress, targetEvmAddress);

      return new GetClearedAmountForQueryResponse(res);
    } catch (error) {
      throw new GetClearedAmountForQueryError(error as Error);
    }
  }
}
