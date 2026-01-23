// SPDX-License-Identifier: Apache-2.0

import { GetHeldAmountForQuery, GetHeldAmountForQueryResponse } from "./GetHeldAmountForQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { GetHeldAmountForQueryError } from "./error/GetHeldAmountForQueryError";

@QueryHandler(GetHeldAmountForQuery)
export class GetHeldAmountForQueryHandler implements IQueryHandler<GetHeldAmountForQuery> {
  constructor(
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetHeldAmountForQuery): Promise<GetHeldAmountForQueryResponse> {
    try {
      const { securityId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getHeldAmountFor(securityEvmAddress, targetEvmAddress);

      return new GetHeldAmountForQueryResponse(res);
    } catch (error) {
      throw new GetHeldAmountForQueryError(error as Error);
    }
  }
}
