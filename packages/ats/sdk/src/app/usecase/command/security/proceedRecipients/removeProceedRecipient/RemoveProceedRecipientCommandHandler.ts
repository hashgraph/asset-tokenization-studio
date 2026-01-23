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
import { RemoveProceedRecipientCommand, RemoveProceedRecipientCommandResponse } from "./RemoveProceedRecipientCommand";
import { RemoveProceedRecipientCommandError } from "./error/RemoveProceedRecipientCommandError";

@CommandHandler(RemoveProceedRecipientCommand)
export class RemoveProceedRecipientCommandHandler implements ICommandHandler<RemoveProceedRecipientCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: RemoveProceedRecipientCommand): Promise<RemoveProceedRecipientCommandResponse> {
    try {
      const { securityId, proceedRecipient } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const proceedRecipientEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(proceedRecipient);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(
        SecurityRole._PROCEED_RECIPIENT_MANAGER_ROLE,
        account.id.toString(),
        securityId,
      );

      await this.validationService.checkIsProceedRecipient(securityId, proceedRecipient);

      const res = await handler.removeProceedRecipient(securityEvmAddress, proceedRecipientEvmAddress, securityId);

      return Promise.resolve(new RemoveProceedRecipientCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RemoveProceedRecipientCommandError(error as Error);
    }
  }
}
