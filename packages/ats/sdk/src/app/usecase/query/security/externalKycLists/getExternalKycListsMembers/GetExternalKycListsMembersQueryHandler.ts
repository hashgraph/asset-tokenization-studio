// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  GetExternalKycListsMembersQuery,
  GetExternalKycListsMembersQueryResponse,
} from "./GetExternalKycListsMembersQuery";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";

@QueryHandler(GetExternalKycListsMembersQuery)
export class GetExternalKycListsMembersQueryHandler implements IQueryHandler<GetExternalKycListsMembersQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetExternalKycListsMembersQuery): Promise<GetExternalKycListsMembersQueryResponse> {
    const { securityId, start, end } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

    const res = await this.queryAdapter.getExternalKycListsMembers(securityEvmAddress, start, end);

    const updatedRes = await Promise.all(
      res.map(async (address) => (await this.accountService.getAccountInfo(address)).id.toString()),
    );

    return new GetExternalKycListsMembersQueryResponse(updatedRes);
  }
}
