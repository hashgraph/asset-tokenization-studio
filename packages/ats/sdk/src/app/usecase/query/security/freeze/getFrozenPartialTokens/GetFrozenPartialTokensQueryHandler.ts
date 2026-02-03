// SPDX-License-Identifier: Apache-2.0

import { GetFrozenPartialTokensQuery, GetFrozenPartialTokensQueryResponse } from "./GetFrozenPartialTokensQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetFrozenPartialTokensQueryError } from "./error/GetFrozenPartialTokensQueryError";

import BigDecimal from "@domain/context/shared/BigDecimal";
import SecurityService from "@service/security/SecurityService";

@QueryHandler(GetFrozenPartialTokensQuery)
export class GetFrozenPartialTokensQueryHandler implements IQueryHandler<GetFrozenPartialTokensQuery> {
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

  async execute(query: GetFrozenPartialTokensQuery): Promise<GetFrozenPartialTokensQueryResponse> {
    try {
      const { securityId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);
      const security = await this.securityService.get(securityId);

      const res = await this.queryAdapter.getFrozenPartialTokens(securityEvmAddress, targetEvmAddress);
      const amount = BigDecimal.fromStringFixed(res.toString(), security.decimals);

      return new GetFrozenPartialTokensQueryResponse(amount);
    } catch (error) {
      throw new GetFrozenPartialTokensQueryError(error as Error);
    }
  }
}
