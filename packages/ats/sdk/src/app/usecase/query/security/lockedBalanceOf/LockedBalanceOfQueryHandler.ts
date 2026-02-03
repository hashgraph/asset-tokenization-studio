// SPDX-License-Identifier: Apache-2.0

import { LockedBalanceOfQuery, LockedBalanceOfQueryResponse } from "./LockedBalanceOfQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { LockedBalanceOfQueryError } from "./error/LockedBalanceOfQueryError";

@QueryHandler(LockedBalanceOfQuery)
export class LockedBalanceOfQueryHandler implements IQueryHandler<LockedBalanceOfQuery> {
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

  async execute(query: LockedBalanceOfQuery): Promise<LockedBalanceOfQueryResponse> {
    try {
      const { targetId, securityId } = query;
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getLockedBalanceOf(securityEvmAddress, targetEvmAddress);
      const amount = BigDecimal.fromStringFixed(res.toString(), security.decimals);
      return new LockedBalanceOfQueryResponse(amount);
    } catch (error) {
      throw new LockedBalanceOfQueryError(error as Error);
    }
  }
}
