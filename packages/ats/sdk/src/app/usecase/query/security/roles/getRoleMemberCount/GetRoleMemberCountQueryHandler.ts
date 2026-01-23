// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetRoleMemberCountQuery, GetRoleMemberCountQueryResponse } from "./GetRoleMemberCountQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetRoleMemberCountQueryError } from "./error/GetRoleMemberCountQueryError";

@QueryHandler(GetRoleMemberCountQuery)
export class GetRoleMemberCountQueryHandler implements IQueryHandler<GetRoleMemberCountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetRoleMemberCountQuery): Promise<GetRoleMemberCountQueryResponse> {
    try {
      const { role, securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getRoleMemberCount(securityEvmAddress, role);

      return new GetRoleMemberCountQueryResponse(res);
    } catch (error) {
      throw new GetRoleMemberCountQueryError(error as Error);
    }
  }
}
