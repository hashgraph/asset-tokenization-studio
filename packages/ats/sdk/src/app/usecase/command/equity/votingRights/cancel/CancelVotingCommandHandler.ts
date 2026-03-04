// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { CancelVotingCommand, CancelVotingCommandResponse } from "./CancelVotingCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { CancelVotingCommandError } from "./error/CancelVotingCommandError";

@CommandHandler(CancelVotingCommand)
export class CancelVotingCommandHandler implements ICommandHandler<CancelVotingCommand> {
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

  async execute(command: CancelVotingCommand): Promise<CancelVotingCommandResponse> {
    try {
      const { securityId, votingId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(SecurityRole._CORPORATEACTIONS_ROLE, account.evmAddress!, securityId);

      const res = await handler.cancelVoting(securityEvmAddress, votingId, securityId);

      return Promise.resolve(new CancelVotingCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new CancelVotingCommandError(error as Error);
    }
  }
}
