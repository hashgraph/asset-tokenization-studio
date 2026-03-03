// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { AddKpiDataCommand, AddKpiDataCommandResponse } from "./AddKpiDataCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { AddKpiDataCommandError } from "./error/AddKpiDataCommandError";
import ValidationService from "@service/validation/ValidationService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import AccountService from "@service/account/AccountService";

@CommandHandler(AddKpiDataCommand)
export class AddKpiDataCommandHandler implements ICommandHandler<AddKpiDataCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(command: AddKpiDataCommand): Promise<AddKpiDataCommandResponse> {
    try {
      const { securityId, date, value, project } = command;

      const transactionAdapter = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(SecurityRole._KPI_MANAGER_ROLE, account.id.toString(), securityId);

      const result = await transactionAdapter.addKpiData(
        new EvmAddress(securityId),
        date,
        value,
        new EvmAddress(project),
        securityId,
      );

      return new AddKpiDataCommandResponse(result.id!);
    } catch (error) {
      throw new AddKpiDataCommandError(error as Error);
    }
  }
}
