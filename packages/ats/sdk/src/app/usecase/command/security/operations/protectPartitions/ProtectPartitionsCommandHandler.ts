// SPDX-License-Identifier: Apache-2.0

import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { ProtectPartitionsCommand, ProtectPartitionsCommandResponse } from "./ProtectPartitionsCommand";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ProtectPartitionsCommandError } from "./error/ProtectPartitionsCommandError";

@CommandHandler(ProtectPartitionsCommand)
export class ProtectPartitionsCommandHandler implements ICommandHandler<ProtectPartitionsCommand> {
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

  async execute(command: ProtectPartitionsCommand): Promise<ProtectPartitionsCommandResponse> {
    try {
      const { securityId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._PROTECTED_PARTITION_ROLE, account.id.toString(), securityId);

      await this.validationService.checkUnprotectedPartitions(security);

      const res = await handler.protectPartitions(securityEvmAddress, command.securityId);
      return Promise.resolve(new ProtectPartitionsCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ProtectPartitionsCommandError(error as Error);
    }
  }
}
