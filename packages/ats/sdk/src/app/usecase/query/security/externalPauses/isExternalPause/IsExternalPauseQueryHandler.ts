// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import { IsExternalPauseQuery, IsExternalPauseQueryResponse } from "./IsExternalPauseQuery";
import ContractService from "@service/contract/ContractService";

@QueryHandler(IsExternalPauseQuery)
export class IsExternalPauseQueryHandler implements IQueryHandler<IsExternalPauseQuery> {
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: IsExternalPauseQuery): Promise<IsExternalPauseQueryResponse> {
    const { securityId, externalPauseAddress } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress = await this.contractService.getContractEvmAddress(securityId);

    const externalPauseEvmAddress = await this.contractService.getContractEvmAddress(externalPauseAddress);

    const res = await this.queryAdapter.isExternalPause(securityEvmAddress, externalPauseEvmAddress);
    return new IsExternalPauseQueryResponse(res);
  }
}
