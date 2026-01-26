// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetTokenBySaltQuery, GetTokenBySaltQueryResponse } from "./GetTokenBySaltQuery";
import AccountService from "@service/account/AccountService";
import { GetTokenBySaltQueryError } from "./error/GetTokenBySaltQueryError";

@QueryHandler(GetTokenBySaltQuery)
export class GetTokenBySaltQueryHandler implements IQueryHandler<GetTokenBySaltQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetTokenBySaltQuery): Promise<GetTokenBySaltQueryResponse> {
    try {
      const { salt, factory } = query;

      const factoryEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(factory);

      const token: string = await this.queryAdapter.getTrexTokenBySalt(factoryEvmAddress, salt);

      return Promise.resolve(new GetTokenBySaltQueryResponse(token));
    } catch (error) {
      throw new GetTokenBySaltQueryError(error as Error);
    }
  }
}
