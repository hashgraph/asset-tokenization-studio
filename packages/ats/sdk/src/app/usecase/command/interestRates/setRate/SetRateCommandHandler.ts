// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { SetRateCommand, SetRateCommandResponse } from "./SetRateCommand";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import { SetRateCommandError } from "./error/SetRateCommandError";
import ValidationService from "@service/validation/ValidationService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import AccountService from "@service/account/AccountService";

@CommandHandler(SetRateCommand)
export class SetRateCommandHandler implements ICommandHandler<SetRateCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(command: SetRateCommand): Promise<SetRateCommandResponse> {
    try {
      const { securityId, rate, rateDecimals } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(
        SecurityRole._INTEREST_RATE_MANAGER_ROLE,
        account.id.toString(),
        securityId,
      );

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const rateBd = BigDecimal.fromString(rate, rateDecimals);
      const res = await handler.setRate(securityEvmAddress, rateBd, rateDecimals, securityId);

      return Promise.resolve(new SetRateCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new SetRateCommandError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
