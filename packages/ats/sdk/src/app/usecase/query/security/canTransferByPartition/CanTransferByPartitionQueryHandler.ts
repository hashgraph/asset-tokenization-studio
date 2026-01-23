// SPDX-License-Identifier: Apache-2.0

import { CanTransferByPartitionQuery, CanTransferByPartitionQueryResponse } from "./CanTransferByPartitionQuery";
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
import { CanTransferByPartitionQueryError } from "./error/CanTransferByPartitionQueryError";

@QueryHandler(CanTransferByPartitionQuery)
export class CanTransferByPartitionQueryHandler implements IQueryHandler<CanTransferByPartitionQuery> {
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

  async execute(query: CanTransferByPartitionQuery): Promise<CanTransferByPartitionQueryResponse> {
    try {
      const { securityId, sourceId, targetId, partitionId, amount } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);
      const account = this.accountService.getCurrentAccount();

      const security = await this.securityService.get(securityId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      const [, statusCode, reason] = await this.queryAdapter.canTransferByPartition(
        securityEvmAddress,
        sourceEvmAddress,
        targetEvmAddress,
        amountBd,
        partitionId,
        EMPTY_BYTES,
        EMPTY_BYTES,
        account.evmAddress!,
      );

      return new CanTransferByPartitionQueryResponse([statusCode, reason]);
    } catch (error) {
      throw new CanTransferByPartitionQueryError(error as Error);
    }
  }
}
