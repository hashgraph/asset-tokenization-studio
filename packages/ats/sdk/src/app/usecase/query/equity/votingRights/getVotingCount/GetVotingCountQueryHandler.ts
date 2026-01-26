// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetVotingCountQuery, GetVotingCountQueryResponse } from "./GetVotingCountQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetVotingCountQueryError } from "./error/GetVotingCountQueryError";

@QueryHandler(GetVotingCountQuery)
export class GetVotingCountQueryHandler implements IQueryHandler<GetVotingCountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetVotingCountQuery): Promise<GetVotingCountQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getVotingsCount(securityEvmAddress);

      return new GetVotingCountQueryResponse(res);
    } catch (error) {
      throw new GetVotingCountQueryError(error as Error);
    }
  }
}
