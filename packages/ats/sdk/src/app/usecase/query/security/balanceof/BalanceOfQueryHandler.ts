// SPDX-License-Identifier: Apache-2.0

import { BalanceOfQuery, BalanceOfQueryResponse } from "./BalanceOfQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { BalanceOfQueryError } from "./error/BalanceOfQueryError";

@QueryHandler(BalanceOfQuery)
export class BalanceOfQueryHandler implements IQueryHandler<BalanceOfQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: BalanceOfQuery): Promise<BalanceOfQueryResponse> {
    try {
      const { targetId, securityId } = query;
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.balanceOf(securityEvmAddress, targetEvmAddress);
      const amount = BigDecimal.fromStringFixed(res.toString(), security.decimals);
      return new BalanceOfQueryResponse(amount);
    } catch (error) {
      throw new BalanceOfQueryError(error as Error);
    }
  }
}
