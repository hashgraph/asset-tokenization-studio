// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import TransactionService from "@service/transaction/TransactionService";
import { UnprotectPartitionsCommand, UnprotectPartitionsCommandResponse } from "./UnprotectPartitionsCommand";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { UnprotectPartitionsCommandError } from "./error/UnprotectPartitionsCommandError";

@CommandHandler(UnprotectPartitionsCommand)
export class UnprotectPartitionsCommandHandler implements ICommandHandler<UnprotectPartitionsCommand> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: UnprotectPartitionsCommand): Promise<UnprotectPartitionsCommandResponse> {
    try {
      const { securityId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkRole(SecurityRole._PROTECTED_PARTITION_ROLE, account.id.toString(), securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkProtectedPartitions(security);

      const res = await handler.unprotectPartitions(securityEvmAddress, command.securityId);
      return Promise.resolve(new UnprotectPartitionsCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new UnprotectPartitionsCommandError(error as Error);
    }
  }
}
