// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { PauseCommand, PauseCommandResponse } from "./PauseCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { PauseCommandError } from "./error/PauseCommandError";

@CommandHandler(PauseCommand)
export class PauseCommandHandler implements ICommandHandler<PauseCommand> {
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

  async execute(command: PauseCommand): Promise<PauseCommandResponse> {
    try {
      const { securityId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkRole(SecurityRole._PAUSER_ROLE, account.id.toString(), securityId);

      await this.validationService.checkPause(securityId);

      const res = await handler.pause(securityEvmAddress, securityId);
      return Promise.resolve(new PauseCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new PauseCommandError(error as Error);
    }
  }
}
