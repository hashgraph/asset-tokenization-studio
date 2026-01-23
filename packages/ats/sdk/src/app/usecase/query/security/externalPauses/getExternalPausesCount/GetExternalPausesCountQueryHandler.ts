// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetExternalPausesCountQuery, GetExternalPausesCountQueryResponse } from "./GetExternalPausesCountQuery";
import ContractService from "@service/contract/ContractService";

@QueryHandler(GetExternalPausesCountQuery)
export class GetExternalPausesCountQueryHandler implements IQueryHandler<GetExternalPausesCountQuery> {
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetExternalPausesCountQuery): Promise<GetExternalPausesCountQueryResponse> {
    const { securityId } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

    const res = await this.queryAdapter.getExternalPausesCount(securityEvmAddress);
    return new GetExternalPausesCountQueryResponse(res);
  }
}
