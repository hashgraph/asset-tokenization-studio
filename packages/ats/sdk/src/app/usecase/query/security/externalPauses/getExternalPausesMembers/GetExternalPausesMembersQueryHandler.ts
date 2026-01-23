// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetExternalPausesMembersQuery, GetExternalPausesMembersQueryResponse } from "./GetExternalPausesMembersQuery";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";

@QueryHandler(GetExternalPausesMembersQuery)
export class GetExternalPausesMembersQueryHandler implements IQueryHandler<GetExternalPausesMembersQuery> {
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

  async execute(query: GetExternalPausesMembersQuery): Promise<GetExternalPausesMembersQueryResponse> {
    const { securityId, start, end } = query;
    await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

    const res = await this.queryAdapter.getExternalPausesMembers(securityEvmAddress, start, end);

    const updatedRes = await Promise.all(
      res.map(async (address) => (await this.accountService.getAccountInfo(address)).id.toString()),
    );

    return new GetExternalPausesMembersQueryResponse(updatedRes);
  }
}
