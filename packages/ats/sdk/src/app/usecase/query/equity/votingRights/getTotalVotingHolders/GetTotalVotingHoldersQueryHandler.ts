// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalVotingHoldersQueryError } from "./error/GetTotalVotingHoldersQueryError";
import { GetTotalVotingHoldersQuery, GetTotalVotingHoldersQueryResponse } from "./GetTotalVotingHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetTotalVotingHoldersQuery)
export class GetTotalVotingHoldersQueryHandler implements IQueryHandler<GetTotalVotingHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetTotalVotingHoldersQuery): Promise<GetTotalVotingHoldersQueryResponse> {
    try {
      const { securityId, voteId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getTotalVotingHolders(securityEvmAddress, voteId);

      return new GetTotalVotingHoldersQueryResponse(res);
    } catch (error) {
      throw new GetTotalVotingHoldersQueryError(error as Error);
    }
  }
}
