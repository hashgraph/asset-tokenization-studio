// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { ActivateClearingCommand, ActivateClearingCommandResponse } from "./ActivateClearingCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ActivateClearingCommandError } from "./error/ActivateClearingCommandError";

@CommandHandler(ActivateClearingCommand)
export class ActivateClearingCommandHandler implements ICommandHandler<ActivateClearingCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: ActivateClearingCommand): Promise<ActivateClearingCommandResponse> {
    try {
      const { securityId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._CLEARING_ROLE, account.id.toString(), securityId);

      const res = await handler.activateClearing(securityEvmAddress, securityId);
      return Promise.resolve(new ActivateClearingCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ActivateClearingCommandError(error as Error);
    }
  }
}
