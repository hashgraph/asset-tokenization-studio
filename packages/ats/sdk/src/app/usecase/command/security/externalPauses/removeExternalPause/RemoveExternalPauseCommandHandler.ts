// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { RemoveExternalPauseCommand, RemoveExternalPauseCommandResponse } from "./RemoveExternalPauseCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import { RemoveExternalPauseCommandError } from "./error/RemoveExternalPauseCommandError";

@CommandHandler(RemoveExternalPauseCommand)
export class RemoveExternalPauseCommandHandler implements ICommandHandler<RemoveExternalPauseCommand> {
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

  async execute(command: RemoveExternalPauseCommand): Promise<RemoveExternalPauseCommandResponse> {
    try {
      const { securityId, externalPauseAddress } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._PAUSE_MANAGER_ROLE, account.id.toString(), securityId);

      const externalPausesEvmAddress = await this.contractService.getContractEvmAddress(externalPauseAddress);

      const res = await handler.removeExternalPause(securityEvmAddress, externalPausesEvmAddress, securityId);

      return Promise.resolve(new RemoveExternalPauseCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RemoveExternalPauseCommandError(error as Error);
    }
  }
}
