// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetVotingForQuery, GetVotingForQueryResponse } from "./GetVotingForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetVotingForQueryError } from "./error/GetVotingForQueryError";

@QueryHandler(GetVotingForQuery)
export class GetVotingForQueryHandler implements IQueryHandler<GetVotingForQuery> {
  constructor(
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetVotingForQuery): Promise<GetVotingForQueryResponse> {
    try {
      const { targetId, securityId, votingId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getVotingFor(securityEvmAddress, targetEvmAddress, votingId);

      return new GetVotingForQueryResponse(res.tokenBalance, res.decimals);
    } catch (error) {
      throw new GetVotingForQueryError(error as Error);
    }
  }
}
