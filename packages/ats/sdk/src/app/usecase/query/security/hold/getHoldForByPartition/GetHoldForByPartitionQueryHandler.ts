// SPDX-License-Identifier: Apache-2.0

import { GetHoldForByPartitionQuery, GetHoldForByPartitionQueryResponse } from "./GetHoldForByPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetHoldForByPartitionQueryError } from "./error/GetHoldForByPartitionQueryError";

@QueryHandler(GetHoldForByPartitionQuery)
export class GetHoldForByPartitionQueryHandler implements IQueryHandler<GetHoldForByPartitionQuery> {
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

  async execute(query: GetHoldForByPartitionQuery): Promise<GetHoldForByPartitionQueryResponse> {
    try {
      const { securityId, partitionId, targetId, holdId } = query;
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const holdDetail = await this.queryAdapter.getHoldForByPartition(
        securityEvmAddress,
        partitionId,
        targetEvmAddress,
        holdId,
      );

      holdDetail.amount = BigDecimal.fromStringFixed(holdDetail.amount.toString(), security.decimals).toBigInt();

      return new GetHoldForByPartitionQueryResponse(holdDetail);
    } catch (error) {
      throw new GetHoldForByPartitionQueryError(error as Error);
    }
  }
}
