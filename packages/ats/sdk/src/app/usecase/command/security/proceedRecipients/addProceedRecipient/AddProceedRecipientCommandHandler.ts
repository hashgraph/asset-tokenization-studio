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
import { AddProceedRecipientCommand, AddProceedRecipientCommandResponse } from "./AddProceedRecipientCommand";
import { AddProceedRecipientCommandError } from "./error/AddProceedRecipientCommandError";

@CommandHandler(AddProceedRecipientCommand)
export class AddProceedRecipientCommandHandler implements ICommandHandler<AddProceedRecipientCommand> {
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

  async execute(command: AddProceedRecipientCommand): Promise<AddProceedRecipientCommandResponse> {
    try {
      const { securityId, proceedRecipient, data } = command;
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

      await this.validationService.checkIsNotProceedRecipient(securityId, proceedRecipient);

      const dataToValidate = !data || data === "" ? "0x" : data;

      const res = await handler.addProceedRecipient(
        securityEvmAddress,
        proceedRecipientEvmAddress,
        dataToValidate,
        securityId,
      );

      return Promise.resolve(new AddProceedRecipientCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new AddProceedRecipientCommandError(error as Error);
    }
  }
}
