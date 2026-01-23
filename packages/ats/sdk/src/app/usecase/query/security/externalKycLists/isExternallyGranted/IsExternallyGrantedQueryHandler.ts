// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { IsExternallyGrantedQuery, IsExternallyGrantedQueryResponse } from "./IsExternallyGrantedQuery";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";

@QueryHandler(IsExternallyGrantedQuery)
export class IsExternallyGrantedQueryHandler implements IQueryHandler<IsExternallyGrantedQuery> {
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: IsExternallyGrantedQuery): Promise<IsExternallyGrantedQueryResponse> {
    const { securityId, kycStatus, targetId } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

    const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

    const res = await this.queryAdapter.isExternallyGranted(securityEvmAddress, kycStatus, targetEvmAddress);
    return new IsExternallyGrantedQueryResponse(res);
  }
}
