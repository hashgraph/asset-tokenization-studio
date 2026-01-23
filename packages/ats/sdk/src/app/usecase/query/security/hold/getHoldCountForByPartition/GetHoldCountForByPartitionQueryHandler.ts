// SPDX-License-Identifier: Apache-2.0

import {
  GetHoldCountForByPartitionQuery,
  GetHoldCountForByPartitionQueryResponse,
} from "./GetHoldCountForByPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetHoldCountForByPartitionQueryError } from "./error/GetHoldCountForByPartitionQueryError";

@QueryHandler(GetHoldCountForByPartitionQuery)
export class GetHoldCountForByPartitionQueryHandler implements IQueryHandler<GetHoldCountForByPartitionQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetHoldCountForByPartitionQuery): Promise<GetHoldCountForByPartitionQueryResponse> {
    try {
      const { securityId, partitionId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getHoldCountForByPartition(securityEvmAddress, partitionId, targetEvmAddress);

      return new GetHoldCountForByPartitionQueryResponse(res);
    } catch (error) {
      throw new GetHoldCountForByPartitionQueryError(error as Error);
    }
  }
}
