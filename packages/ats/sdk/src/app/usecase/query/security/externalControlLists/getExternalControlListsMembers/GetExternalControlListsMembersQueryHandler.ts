// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  GetExternalControlListsMembersQuery,
  GetExternalControlListsMembersQueryResponse,
} from "./GetExternalControlListsMembersQuery";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";

@QueryHandler(GetExternalControlListsMembersQuery)
export class GetExternalControlListsMembersQueryHandler implements IQueryHandler<GetExternalControlListsMembersQuery> {
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetExternalControlListsMembersQuery): Promise<GetExternalControlListsMembersQueryResponse> {
    const { securityId, start, end } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

    const res = await this.queryAdapter.getExternalControlListsMembers(securityEvmAddress, start, end);

    const updatedRes = await Promise.all(
      res.map(async (address) => (await this.accountService.getAccountInfo(address)).id.toString()),
    );

    return new GetExternalControlListsMembersQueryResponse(updatedRes);
  }
}
