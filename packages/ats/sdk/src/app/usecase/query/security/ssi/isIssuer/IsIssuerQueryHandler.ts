// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { IsIssuerQuery, IsIssuerQueryResponse } from "./IsIssuerQuery";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { IsIssuerQueryError } from "./error/IsIssuerQueryError";

@QueryHandler(IsIssuerQuery)
export class IsIssuerQueryHandler implements IQueryHandler<IsIssuerQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: IsIssuerQuery): Promise<IsIssuerQueryResponse> {
    try {
      const { securityId, issuerId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const issuerEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(issuerId.toString());

      const res = await this.queryAdapter.isIssuer(securityEvmAddress, issuerEvmAddress);

      return new IsIssuerQueryResponse(res);
    } catch (error) {
      throw new IsIssuerQueryError(error as Error);
    }
  }
}
