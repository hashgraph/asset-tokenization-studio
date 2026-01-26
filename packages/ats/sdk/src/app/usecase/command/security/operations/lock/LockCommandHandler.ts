// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { LockCommand, LockCommandResponse } from "./LockCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { LockCommandError } from "./error/LockCommandError";

@CommandHandler(LockCommand)
export class LockCommandHandler implements ICommandHandler<LockCommand> {
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

  async execute(command: LockCommand): Promise<LockCommandResponse> {
    try {
      const { securityId, amount, sourceId, expirationDate } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._LOCKER_ROLE, account.id.toString(), securityId);

      await this.validationService.checkDecimals(security, amount);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      const res = await handler.lock(
        securityEvmAddress,
        sourceEvmAddress,
        amountBd,
        BigDecimal.fromString(expirationDate.substring(0, 10)),
        command.securityId,
      );

      return Promise.resolve(new LockCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new LockCommandError(error as Error);
    }
  }
}
