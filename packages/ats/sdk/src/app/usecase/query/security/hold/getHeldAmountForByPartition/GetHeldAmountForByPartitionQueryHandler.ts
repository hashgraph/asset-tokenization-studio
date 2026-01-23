// SPDX-License-Identifier: Apache-2.0

import {
  GetHeldAmountForByPartitionQuery,
  GetHeldAmountForByPartitionQueryResponse,
} from "./GetHeldAmountForByPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetHeldAmountForByPartitionQueryError } from "./error/GetHeldAmountForByPartitionQueryError";

@QueryHandler(GetHeldAmountForByPartitionQuery)
export class GetHeldAmountForByPartitionQueryHandler implements IQueryHandler<GetHeldAmountForByPartitionQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetHeldAmountForByPartitionQuery): Promise<GetHeldAmountForByPartitionQueryResponse> {
    try {
      const { securityId, partitionId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getHeldAmountForByPartition(
        securityEvmAddress,
        partitionId,
        targetEvmAddress,
      );

      return new GetHeldAmountForByPartitionQueryResponse(res);
    } catch (error) {
      throw new GetHeldAmountForByPartitionQueryError(error as Error);
    }
  }
}
