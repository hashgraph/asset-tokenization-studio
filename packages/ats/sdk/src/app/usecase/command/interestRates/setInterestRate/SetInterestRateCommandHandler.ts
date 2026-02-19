// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { SetInterestRateCommand, SetInterestRateCommandResponse } from "./SetInterestRateCommand";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import { SetInterestRateCommandError } from "./error/SetInterestRateCommandError";
import ValidationService from "@service/validation/ValidationService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import AccountService from "@service/account/AccountService";

@CommandHandler(SetInterestRateCommand)
export class SetInterestRateCommandHandler implements ICommandHandler<SetInterestRateCommand> {
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

  async execute(command: SetInterestRateCommand): Promise<SetInterestRateCommandResponse> {
    try {
      const {
        securityId,
        maxRate,
        baseRate,
        minRate,
        startPeriod,
        startRate,
        missedPenalty,
        reportPeriod,
        rateDecimals,
      } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(
        SecurityRole._INTEREST_RATE_MANAGER_ROLE,
        account.id.toString(),
        securityId,
      );

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const maxRateBd = BigDecimal.fromString(maxRate, rateDecimals);
      const baseRateBd = BigDecimal.fromString(baseRate, rateDecimals);
      const minRateBd = BigDecimal.fromString(minRate, rateDecimals);
      const startPeriodBd = BigDecimal.fromString(startPeriod);
      const startRateBd = BigDecimal.fromString(startRate, rateDecimals);
      const missedPenaltyBd = BigDecimal.fromString(missedPenalty, rateDecimals);
      const reportPeriodBd = BigDecimal.fromString(reportPeriod);

      const res = await handler.setInterestRate(
        securityEvmAddress,
        maxRateBd,
        baseRateBd,
        minRateBd,
        startPeriodBd,
        startRateBd,
        missedPenaltyBd,
        reportPeriodBd,
        rateDecimals,
        securityId,
      );

      return Promise.resolve(new SetInterestRateCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new SetInterestRateCommandError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
