// SPDX-License-Identifier: Apache-2.0

import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { RemoveAgentCommand, RemoveAgentCommandResponse } from "./RemoveAgentCommand";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import { RemoveAgentCommandError } from "./error/RemoveAgentCommandError";
import ContractService from "@service/contract/ContractService";

@CommandHandler(RemoveAgentCommand)
export class RemoveAgentCommandHandler implements ICommandHandler<RemoveAgentCommand> {
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

  async execute(command: RemoveAgentCommand): Promise<RemoveAgentCommandResponse> {
    try {
      const { securityId, agentId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const agentEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(agentId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._DEFAULT_ADMIN_ROLE, account.id.toString(), securityId);

      const res = await handler.removeAgent(securityEvmAddress, agentEvmAddress, securityId);
      return Promise.resolve(new RemoveAgentCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RemoveAgentCommandError(error as Error);
    }
  }
}
