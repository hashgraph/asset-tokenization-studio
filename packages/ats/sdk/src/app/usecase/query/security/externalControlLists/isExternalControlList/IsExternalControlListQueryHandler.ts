// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { IsExternalControlListQuery, IsExternalControlListQueryResponse } from "./IsExternalControlListQuery";
import ContractService from "@service/contract/ContractService";

@QueryHandler(IsExternalControlListQuery)
export class IsExternalControlListQueryHandler implements IQueryHandler<IsExternalControlListQuery> {
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: IsExternalControlListQuery): Promise<IsExternalControlListQueryResponse> {
    const { securityId, externalControlListAddress } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

    const externalControlListEvmAddress: EvmAddress =
      await this.contractService.getContractEvmAddress(externalControlListAddress);

    const res = await this.queryAdapter.isExternalControlList(securityEvmAddress, externalControlListEvmAddress);
    return new IsExternalControlListQueryResponse(res);
  }
}
