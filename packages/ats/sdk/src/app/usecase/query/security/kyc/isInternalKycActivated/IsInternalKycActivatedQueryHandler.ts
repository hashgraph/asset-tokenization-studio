// SPDX-License-Identifier: Apache-2.0

import { IsInternalKycActivatedQuery, IsInternalKycActivatedQueryResponse } from "./IsInternalKycActivatedQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import SecurityService from "@service/security/SecurityService";

@QueryHandler(IsInternalKycActivatedQuery)
export class IsInternalKycActivatedQueryHandler implements IQueryHandler<IsInternalKycActivatedQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: IsInternalKycActivatedQuery): Promise<IsInternalKycActivatedQueryResponse> {
    const { securityId } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
    const res = await this.queryAdapter.isInternalKycActivated(securityEvmAddress);
    return new IsInternalKycActivatedQueryResponse(res);
  }
}
