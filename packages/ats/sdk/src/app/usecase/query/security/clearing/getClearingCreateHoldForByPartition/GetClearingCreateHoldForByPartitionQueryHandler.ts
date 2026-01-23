// SPDX-License-Identifier: Apache-2.0

import {
  GetClearingCreateHoldForByPartitionQuery,
  GetClearingCreateHoldForByPartitionQueryResponse,
} from "./GetClearingCreateHoldForByPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetClearingCreateHoldForByPartitionQueryError } from "./error/GetClearingCreateHoldForByPartitionQueryError";

@QueryHandler(GetClearingCreateHoldForByPartitionQuery)
export class GetClearingCreateHoldForByPartitionQueryHandler
  implements IQueryHandler<GetClearingCreateHoldForByPartitionQuery>
{
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(
    query: GetClearingCreateHoldForByPartitionQuery,
  ): Promise<GetClearingCreateHoldForByPartitionQueryResponse> {
    try {
      const { securityId, partitionId, targetId, clearingId } = query;
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const clearing = await this.queryAdapter.getClearingCreateHoldForByPartition(
        securityEvmAddress,
        partitionId,
        targetEvmAddress,
        clearingId,
      );

      clearing.amount = BigDecimal.fromStringFixed(clearing.amount.toString(), security.decimals);

      clearing.holdEscrowId = (await this.accountService.getAccountInfo(clearing.holdEscrowId)).id.toString();

      clearing.holdTo = (await this.accountService.getAccountInfo(clearing.holdTo)).id.toString();

      return new GetClearingCreateHoldForByPartitionQueryResponse(clearing);
    } catch (error) {
      throw new GetClearingCreateHoldForByPartitionQueryError(error as Error);
    }
  }
}
