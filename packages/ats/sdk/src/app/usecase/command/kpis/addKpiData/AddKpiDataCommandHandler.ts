// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { AddKpiDataCommand, AddKpiDataCommandResponse } from "./AddKpiDataCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { AddKpiDataCommandError } from "./error/AddKpiDataCommandError";

@CommandHandler(AddKpiDataCommand)
export class AddKpiDataCommandHandler implements ICommandHandler<AddKpiDataCommand, AddKpiDataCommandResponse> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
  ) {}

  async execute(command: AddKpiDataCommand): Promise<AddKpiDataCommandResponse> {
    try {
      const { securityId, date, value, project } = command;

      const transactionAdapter = this.transactionService.getHandler();
      const result = await transactionAdapter.addKpiData(
        new EvmAddress(securityId),
        date,
        value,
        new EvmAddress(project),
      );

      return new AddKpiDataCommandResponse(result.id!);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new AddKpiDataCommandError(errorMessage);
    }
  }
}
