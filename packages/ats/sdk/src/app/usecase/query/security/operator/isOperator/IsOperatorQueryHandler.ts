// SPDX-License-Identifier: Apache-2.0

import { IsOperatorQuery, IsOperatorQueryResponse } from "./IsOperatorQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { IsOperatorQueryError } from "./error/IsOperatorQueryError";

@QueryHandler(IsOperatorQuery)
export class IsOperatorQueryHandler implements IQueryHandler<IsOperatorQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: IsOperatorQuery): Promise<IsOperatorQueryResponse> {
    try {
      const { securityId, operatorId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const operatorEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(operatorId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.isOperator(securityEvmAddress, operatorEvmAddress, targetEvmAddress);
      return new IsOperatorQueryResponse(res);
    } catch (error) {
      throw new IsOperatorQueryError(error as Error);
    }
  }
}
