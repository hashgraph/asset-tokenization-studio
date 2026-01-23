// SPDX-License-Identifier: Apache-2.0

import {
  GetClearedAmountForByPartitionQuery,
  GetClearedAmountForByPartitionQueryResponse,
} from "./GetClearedAmountForByPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetClearedAmountForByPartitionQueryError } from "./error/GetClearedAmountForByPartitionQueryError";

@QueryHandler(GetClearedAmountForByPartitionQuery)
export class GetClearedAmountForByPartitionQueryHandler implements IQueryHandler<GetClearedAmountForByPartitionQuery> {
  constructor(
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetClearedAmountForByPartitionQuery): Promise<GetClearedAmountForByPartitionQueryResponse> {
    try {
      const { securityId, partitionId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getClearedAmountForByPartition(
        securityEvmAddress,
        partitionId,
        targetEvmAddress,
      );

      return new GetClearedAmountForByPartitionQueryResponse(res);
    } catch (error) {
      throw new GetClearedAmountForByPartitionQueryError(error as Error);
    }
  }
}
