// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { DeactivateCommand, DeactivateCommandResponse } from "./DeactivateCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { DeactivateCommandError } from "./error/DeactivateCommandError";

@CommandHandler(DeactivateCommand)
export class DeactivateCommandHandler implements ICommandHandler<DeactivateCommand> {
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

  async execute(command: DeactivateCommand): Promise<DeactivateCommandResponse> {
    try {
      const { securityId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkRole(SecurityRole._DEACTIVATE_ROLE, account.id.toString(), securityId);

      await this.validationService.checkPause(securityId);

      const res = await handler.deactivate(securityEvmAddress, securityId);
      return Promise.resolve(new DeactivateCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new DeactivateCommandError(error as Error);
    }
  }
}
