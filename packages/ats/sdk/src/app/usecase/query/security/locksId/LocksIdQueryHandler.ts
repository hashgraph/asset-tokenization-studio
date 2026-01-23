// SPDX-License-Identifier: Apache-2.0

import { LocksIdQuery, LocksIdQueryResponse } from "./LocksIdQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { LocksIdQueryError } from "./error/LocksIdQueryError";

@QueryHandler(LocksIdQuery)
export class LocksIdQueryHandler implements IQueryHandler<LocksIdQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: LocksIdQuery): Promise<LocksIdQueryResponse> {
    try {
      const { targetId, securityId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getLocksId(securityEvmAddress, targetEvmAddress, start, end);

      return new LocksIdQueryResponse(res);
    } catch (error) {
      throw new LocksIdQueryError(error as Error);
    }
  }
}
