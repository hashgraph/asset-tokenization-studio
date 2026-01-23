// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetVotingQuery, GetVotingQueryResponse } from "./GetVotingQuery";
import ContractService from "@service/contract/ContractService";
import { GetVotingQueryError } from "./error/GetVotingQueryError";

@QueryHandler(GetVotingQuery)
export class GetVotingQueryHandler implements IQueryHandler<GetVotingQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetVotingQuery): Promise<GetVotingQueryResponse> {
    try {
      const { securityId, votingId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getVoting(securityEvmAddress, votingId);

      return Promise.resolve(new GetVotingQueryResponse(res));
    } catch (error) {
      throw new GetVotingQueryError(error as Error);
    }
  }
}
