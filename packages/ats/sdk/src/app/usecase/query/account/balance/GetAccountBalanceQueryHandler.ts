// SPDX-License-Identifier: Apache-2.0

import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetAccountBalanceQuery, GetAccountBalanceQueryResponse } from "./GetAccountBalanceQuery";
import BigDecimal from "@domain/context/shared/BigDecimal";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetAccountBalanceQueryError } from "./error/GetAccountBalanceQueryError";

@QueryHandler(GetAccountBalanceQuery)
export class GetAccountBalanceQueryHandler implements IQueryHandler<GetAccountBalanceQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetAccountBalanceQuery): Promise<GetAccountBalanceQueryResponse> {
    try {
      const { securityId, targetId } = query;

      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.balanceOf(securityEvmAddress, targetEvmAddress);
      const amount = BigDecimal.fromStringFixed(res.toString(), security.decimals);
      return new GetAccountBalanceQueryResponse(amount);
    } catch (error) {
      throw new GetAccountBalanceQueryError(error as Error);
    }
  }
}
