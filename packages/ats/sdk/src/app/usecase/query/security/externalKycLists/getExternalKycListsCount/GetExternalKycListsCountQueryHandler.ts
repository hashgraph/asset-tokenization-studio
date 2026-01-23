// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetExternalKycListsCountQuery, GetExternalKycListsCountQueryResponse } from "./GetExternalKycListsCountQuery";
import ContractService from "@service/contract/ContractService";

@QueryHandler(GetExternalKycListsCountQuery)
export class GetExternalKycListsCountQueryHandler implements IQueryHandler<GetExternalKycListsCountQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetExternalKycListsCountQuery): Promise<GetExternalKycListsCountQueryResponse> {
    const { securityId } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

    const res = await this.queryAdapter.getExternalKycListsCount(securityEvmAddress);
    return new GetExternalKycListsCountQueryResponse(res);
  }
}
