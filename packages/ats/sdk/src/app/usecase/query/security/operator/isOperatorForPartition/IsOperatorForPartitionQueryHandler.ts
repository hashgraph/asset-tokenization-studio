// SPDX-License-Identifier: Apache-2.0

import { IsOperatorForPartitionQuery, IsOperatorForPartitionQueryResponse } from "./IsOperatorForPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IsOperatorForPartitionQueryError } from "./error/IsOperatorForPartitionQuery";

@QueryHandler(IsOperatorForPartitionQuery)
export class IsOperatorForPartitionQueryHandler implements IQueryHandler<IsOperatorForPartitionQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: IsOperatorForPartitionQuery): Promise<IsOperatorForPartitionQueryResponse> {
    try {
      const { securityId, partitionId, operatorId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const operatorEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(operatorId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.isOperatorForPartition(
        securityEvmAddress,
        partitionId,
        operatorEvmAddress,
        targetEvmAddress,
      );
      return new IsOperatorForPartitionQueryResponse(res);
    } catch (error) {
      throw new IsOperatorForPartitionQueryError(error as Error);
    }
  }
}
