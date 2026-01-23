// SPDX-License-Identifier: Apache-2.0

import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { IsInControlListQuery, IsInControlListQueryResponse } from "./IsInControlListQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { IsInControlListQueryError } from "./error/IsInControlListQueryError";

@QueryHandler(IsInControlListQuery)
export class IsInControlListQueryHandler implements IQueryHandler<IsInControlListQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: IsInControlListQuery): Promise<IsInControlListQueryResponse> {
    try {
      const { securityId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.isAccountInControlList(securityEvmAddress, targetEvmAddress);

      return new IsInControlListQueryResponse(res);
    } catch (error) {
      throw new IsInControlListQueryError(error as Error);
    }
  }
}
