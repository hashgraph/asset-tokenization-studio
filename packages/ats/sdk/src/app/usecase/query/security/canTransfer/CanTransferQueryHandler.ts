// SPDX-License-Identifier: Apache-2.0

import { CanTransferQuery, CanTransferQueryResponse } from "./CanTransferQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import ValidationService from "@service/validation/ValidationService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { EMPTY_BYTES } from "@core/Constants";
import ContractService from "@service/contract/ContractService";
import { CanTransferQueryError } from "./error/CanTransferQueryError";

@QueryHandler(CanTransferQuery)
export class CanTransferQueryHandler implements IQueryHandler<CanTransferQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: CanTransferQuery): Promise<CanTransferQueryResponse> {
    try {
      const { securityId, targetId, amount } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);
      const account = this.accountService.getCurrentAccount();

      const security = await this.securityService.get(securityId);

      await this.validationService.checkDecimals(security, amount);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      const [, res] = await this.queryAdapter.canTransfer(
        securityEvmAddress,
        targetEvmAddress,
        amountBd,
        EMPTY_BYTES,
        account.evmAddress!,
      );

      return new CanTransferQueryResponse(res);
    } catch (error) {
      throw new CanTransferQueryError(error as Error);
    }
  }
}
