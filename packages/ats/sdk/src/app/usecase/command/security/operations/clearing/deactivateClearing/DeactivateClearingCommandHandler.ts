// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { DeactivateClearingCommand, DeactivateClearingCommandResponse } from "./DeactivateClearingCommand";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { DeactivateClearingCommandError } from "./error/DeactivateClearingCommandError";

@CommandHandler(DeactivateClearingCommand)
export class DeactivateClearingCommandHandler implements ICommandHandler<DeactivateClearingCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: DeactivateClearingCommand): Promise<DeactivateClearingCommandResponse> {
    try {
      const { securityId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._CLEARING_ROLE, account.id.toString(), securityId);

      const res = await handler.deactivateClearing(securityEvmAddress, securityId);
      return Promise.resolve(new DeactivateClearingCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new DeactivateClearingCommandError(error as Error);
    }
  }
}
