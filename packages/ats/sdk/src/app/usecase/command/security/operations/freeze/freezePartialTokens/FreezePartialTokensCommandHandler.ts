// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { FreezePartialTokensCommandError } from "./error/FreezePartialTokensCommandError";
import { FreezePartialTokensCommand, FreezePartialTokensResponse } from "./FreezePartialTokensCommand";
import BigDecimal from "@domain/context/shared/BigDecimal";
import SecurityService from "@service/security/SecurityService";

@CommandHandler(FreezePartialTokensCommand)
export class FreezePartialTokensCommandHandler implements ICommandHandler<FreezePartialTokensCommand> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: FreezePartialTokensCommand): Promise<FreezePartialTokensResponse> {
    try {
      const { securityId, amount, targetId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);
      const security = await this.securityService.get(securityId);
      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkAnyRole(
        [SecurityRole._FREEZE_MANAGER_ROLE, SecurityRole._AGENT_ROLE],
        account.id.toString(),
        securityId,
      );

      const res = await handler.freezePartialTokens(
        securityEvmAddress,
        BigDecimal.fromString(amount, security.decimals),
        await this.accountService.getAccountEvmAddress(targetId),
        securityId,
      );

      return Promise.resolve(new FreezePartialTokensResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new FreezePartialTokensCommandError(error as Error);
    }
  }
}
