// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetControlListMembersQuery, GetControlListMembersQueryResponse } from "./GetControlListMembersQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetControlListMembersQueryError } from "./error/GetControlListMembersQueryError";

@QueryHandler(GetControlListMembersQuery)
export class GetControlListMembersQueryHandler implements IQueryHandler<GetControlListMembersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetControlListMembersQuery): Promise<GetControlListMembersQueryResponse> {
    try {
      const { securityId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getControlListMembers(securityEvmAddress, start, end);

      return new GetControlListMembersQueryResponse(res);
    } catch (error) {
      throw new GetControlListMembersQueryError(error as Error);
    }
  }
}
