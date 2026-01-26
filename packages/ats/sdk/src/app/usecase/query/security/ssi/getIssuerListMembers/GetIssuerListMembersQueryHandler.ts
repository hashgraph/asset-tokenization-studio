// SPDX-License-Identifier: Apache-2.0

import { GetIssuerListMembersQuery, GetIssuerListMembersQueryResponse } from "./GetIssuerListMembersQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetIssuerListMembersQueryError } from "./error/GetIssuerListMembersQueryError";

@QueryHandler(GetIssuerListMembersQuery)
export class GetIssuerListMembersQueryHandler implements IQueryHandler<GetIssuerListMembersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetIssuerListMembersQuery): Promise<GetIssuerListMembersQueryResponse> {
    try {
      const { securityId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getIssuerListMembers(securityEvmAddress, start, end);

      const hederaIds = await Promise.all(
        res.map(async (t) => (await this.accountService.getAccountInfo(t)).id.toString()),
      );
      return new GetIssuerListMembersQueryResponse(hederaIds);
    } catch (error) {
      throw new GetIssuerListMembersQueryError(error as Error);
    }
  }
}
