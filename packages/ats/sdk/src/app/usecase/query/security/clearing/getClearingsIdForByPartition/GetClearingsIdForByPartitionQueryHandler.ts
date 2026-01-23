// SPDX-License-Identifier: Apache-2.0

import {
  GetClearingsIdForByPartitionQuery,
  GetClearingsIdForByPartitionQueryResponse,
} from "./GetClearingsIdForByPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetClearingsIdForByPartitionQueryError } from "./error/GetClearingsIdForByPartitionQueryError";

@QueryHandler(GetClearingsIdForByPartitionQuery)
export class GetClearingsIdForByPartitionQueryHandler implements IQueryHandler<GetClearingsIdForByPartitionQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetClearingsIdForByPartitionQuery): Promise<GetClearingsIdForByPartitionQueryResponse> {
    try {
      const { securityId, partitionId, targetId, clearingOperationType, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getClearingsIdForByPartition(
        securityEvmAddress,
        partitionId,
        targetEvmAddress,
        clearingOperationType,
        start,
        end,
      );

      return new GetClearingsIdForByPartitionQueryResponse(res);
    } catch (error) {
      throw new GetClearingsIdForByPartitionQueryError(error as Error);
    }
  }
}
