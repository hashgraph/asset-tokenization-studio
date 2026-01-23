// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetSecurityHoldersQueryError } from "./error/GetSecurityHoldersQueryError";
import { GetSecurityHoldersQuery, GetSecurityHoldersQueryResponse } from "./GetSecurityHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetSecurityHoldersQuery)
export class GetSecurityHoldersQueryHandler implements IQueryHandler<GetSecurityHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetSecurityHoldersQuery): Promise<GetSecurityHoldersQueryResponse> {
    try {
      const { securityId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getSecurityHolders(securityEvmAddress, start, end);

      const updatedRes = await Promise.all(
        res.map(async (address) => (await this.accountService.getAccountInfo(address)).id.toString()),
      );

      return new GetSecurityHoldersQueryResponse(updatedRes);
    } catch (error) {
      throw new GetSecurityHoldersQueryError(error as Error);
    }
  }
}
