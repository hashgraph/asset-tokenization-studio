// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { IsExternalKycListQuery, IsExternalKycListQueryResponse } from "./IsExternalKycListQuery";
import ContractService from "@service/contract/ContractService";

@QueryHandler(IsExternalKycListQuery)
export class IsExternalKycListQueryHandler implements IQueryHandler<IsExternalKycListQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: IsExternalKycListQuery): Promise<IsExternalKycListQueryResponse> {
    const { securityId, externalKycListAddress } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

    const externalKycListEvmAddress: EvmAddress =
      await this.contractService.getContractEvmAddress(externalKycListAddress);

    const res = await this.queryAdapter.isExternalKycList(securityEvmAddress, externalKycListEvmAddress);
    return new IsExternalKycListQueryResponse(res);
  }
}
