// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetRoleMembersQuery, GetRoleMembersQueryResponse } from "./GetRoleMembersQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetRoleMembersQueryError } from "./error/GetRoleMembersQueryError";

@QueryHandler(GetRoleMembersQuery)
export class GetRoleMembersQueryHandler implements IQueryHandler<GetRoleMembersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetRoleMembersQuery): Promise<GetRoleMembersQueryResponse> {
    try {
      const { role, securityId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getRoleMembers(securityEvmAddress, role, start, end);

      return new GetRoleMembersQueryResponse(res);
    } catch (error) {
      throw new GetRoleMembersQueryError(error as Error);
    }
  }
}
