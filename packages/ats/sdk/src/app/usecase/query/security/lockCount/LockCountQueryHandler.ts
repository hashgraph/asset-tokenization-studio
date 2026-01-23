// SPDX-License-Identifier: Apache-2.0

import { LockCountQuery, LockCountQueryResponse } from "./LockCountQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { LockCountQueryError } from "./error/LockCountQueryError";

@QueryHandler(LockCountQuery)
export class LockCountQueryHandler implements IQueryHandler<LockCountQuery> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: LockCountQuery): Promise<LockCountQueryResponse> {
    try {
      const { targetId, securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getLockCount(securityEvmAddress, targetEvmAddress);

      return new LockCountQueryResponse(res);
    } catch (error) {
      throw new LockCountQueryError(error as Error);
    }
  }
}
