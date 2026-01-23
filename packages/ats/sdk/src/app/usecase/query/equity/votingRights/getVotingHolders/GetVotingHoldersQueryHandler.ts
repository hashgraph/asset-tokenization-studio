// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetVotingHoldersQueryError } from "./error/GetVotingHoldersQueryError";
import { GetVotingHoldersQuery, GetVotingHoldersQueryResponse } from "./GetVotingHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetVotingHoldersQuery)
export class GetVotingHoldersQueryHandler implements IQueryHandler<GetVotingHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetVotingHoldersQuery): Promise<GetVotingHoldersQueryResponse> {
    try {
      const { securityId, voteId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getVotingHolders(securityEvmAddress, voteId, start, end);

      const updatedRes = await Promise.all(
        res.map(async (address) => (await this.accountService.getAccountInfo(address)).id.toString()),
      );

      return new GetVotingHoldersQueryResponse(updatedRes);
    } catch (error) {
      throw new GetVotingHoldersQueryError(error as Error);
    }
  }
}
