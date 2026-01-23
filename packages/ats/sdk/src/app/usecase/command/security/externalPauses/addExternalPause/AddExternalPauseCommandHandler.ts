// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { AddExternalPauseCommand, AddExternalPauseCommandResponse } from "./AddExternalPauseCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { AddExternalPauseCommandError } from "./error/AddExternalPauseCommandError";

@CommandHandler(AddExternalPauseCommand)
export class AddExternalPauseCommandHandler implements ICommandHandler<AddExternalPauseCommand> {
  constructor(
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    public readonly contractService: ContractService,
    @lazyInject(ValidationService)
    public readonly validationService: ValidationService,
  ) {}

  async execute(command: AddExternalPauseCommand): Promise<AddExternalPauseCommandResponse> {
    try {
      const { securityId, externalPauseAddress } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._PAUSE_MANAGER_ROLE, account.id.toString(), securityId);

      const externalPausesEvmAddress = await this.contractService.getContractEvmAddress(externalPauseAddress);

      const res = await handler.addExternalPause(securityEvmAddress, externalPausesEvmAddress, securityId);

      return Promise.resolve(new AddExternalPauseCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new AddExternalPauseCommandError(error as Error);
    }
  }
}
