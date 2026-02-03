// SPDX-License-Identifier: Apache-2.0

import { CanRedeemByPartitionQuery, CanRedeemByPartitionQueryResponse } from "./CanRedeemByPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { EMPTY_BYTES } from "@core/Constants";
import ContractService from "@service/contract/ContractService";
import { CanRedeemByPartitionQueryError } from "./error/CanRedeemByPartitionQueryError";

@QueryHandler(CanRedeemByPartitionQuery)
export class CanRedeemByPartitionQueryHandler implements IQueryHandler<CanRedeemByPartitionQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: CanRedeemByPartitionQuery): Promise<CanRedeemByPartitionQueryResponse> {
    try {
      const { securityId, sourceId, partitionId, amount } = query;

      const account = await this.accountService.getCurrentAccount();
      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);
      const security = await this.securityService.get(securityId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      const [, statusCode, reason] = await this.queryAdapter.canRedeemByPartition(
        securityEvmAddress,
        sourceEvmAddress,
        amountBd,
        partitionId,
        EMPTY_BYTES,
        EMPTY_BYTES,
        account.evmAddress!,
      );

      return new CanRedeemByPartitionQueryResponse([statusCode, reason]);
    } catch (error) {
      throw new CanRedeemByPartitionQueryError(error as Error);
    }
  }
}
