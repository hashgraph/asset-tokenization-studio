// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { SetRateCommand, SetRateCommandResponse } from "./SetRateCommand";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import { SetRateCommandError } from "./error/SetRateCommandError";
import ValidationService from "@service/validation/ValidationService";

@CommandHandler(SetRateCommand)
export class SetRateCommandHandler implements ICommandHandler<SetRateCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: SetRateCommand): Promise<SetRateCommandResponse> {
    try {
      const {
        securityId,
        //rate,
        //rateDecimals
      } = command;
      //const handler = this.transactionService.getHandler();

      await this.validationService.checkPause(securityId);
      // TODO ruben.martinez
      // await this.validationService.checkRole(SecurityRole.<expected_role>, account.id.toString(), securityId);

      // TODO: Implementar la lógica para establecer la tasa de interés

      return new SetRateCommandResponse(true, "pending");
    } catch (error) {
      throw new SetRateCommandError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
