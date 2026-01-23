// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import TransactionService from "@service/transaction/TransactionService";
import { UnpauseCommand, UnpauseCommandResponse } from "./UnpauseCommand";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import { UnpauseCommandError } from "./error/UnpauseCommandError";

@CommandHandler(UnpauseCommand)
export class UnpauseCommandHandler implements ICommandHandler<UnpauseCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: UnpauseCommand): Promise<UnpauseCommandResponse> {
    try {
      const { securityId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkRole(SecurityRole._PAUSER_ROLE, account.id.toString(), securityId);

      await this.validationService.checkUnpause(securityId);

      const res = await handler.unpause(securityEvmAddress, securityId);
      return Promise.resolve(new UnpauseCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new UnpauseCommandError(error as Error);
    }
  }
}
