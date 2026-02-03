// SPDX-License-Identifier: Apache-2.0

import {
  GetClearingCountForByPartitionQuery,
  GetClearingCountForByPartitionQueryResponse,
} from "./GetClearingCountForByPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetClearingCountForByPartitionQueryError } from "./error/GetClearingCountForByPartitionQueryError";

@QueryHandler(GetClearingCountForByPartitionQuery)
export class GetClearingCountForByPartitionQueryHandler implements IQueryHandler<GetClearingCountForByPartitionQuery> {
  constructor(
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetClearingCountForByPartitionQuery): Promise<GetClearingCountForByPartitionQueryResponse> {
    try {
      const { securityId, partitionId, targetId, clearingOperationType } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getClearingCountForByPartition(
        securityEvmAddress,
        partitionId,
        targetEvmAddress,
        clearingOperationType,
      );

      return new GetClearingCountForByPartitionQueryResponse(res);
    } catch (error) {
      throw new GetClearingCountForByPartitionQueryError(error as Error);
    }
  }
}
