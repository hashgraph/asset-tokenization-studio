// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  GetExternalControlListsCountQuery,
  GetExternalControlListsCountQueryResponse,
} from "./GetExternalControlListsCountQuery";
import ContractService from "@service/contract/ContractService";

@QueryHandler(GetExternalControlListsCountQuery)
export class GetExternalControlListsCountQueryHandler implements IQueryHandler<GetExternalControlListsCountQuery> {
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetExternalControlListsCountQuery): Promise<GetExternalControlListsCountQueryResponse> {
    const { securityId } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

    const res = await this.queryAdapter.getExternalControlListsCount(securityEvmAddress);
    return new GetExternalControlListsCountQueryResponse(res);
  }
}
