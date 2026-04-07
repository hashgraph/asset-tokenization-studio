// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { SetAmortizationCommand, SetAmortizationCommandResponse } from "./SetAmortizationCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { SetAmortizationCommandError } from "./error/SetAmortizationCommandError";

@CommandHandler(SetAmortizationCommand)
export class SetAmortizationCommandHandler implements ICommandHandler<SetAmortizationCommand> {
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

  async execute(command: SetAmortizationCommand): Promise<SetAmortizationCommandResponse> {
    try {
      const { securityId, recordDate, executionDate, tokensToRedeem } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(SecurityRole._CORPORATEACTIONS_ROLE, account.evmAddress!, securityId);

      const res = await handler.setAmortization(
        securityEvmAddress,
        BigDecimal.fromString(recordDate),
        BigDecimal.fromString(executionDate),
        BigDecimal.fromString(tokensToRedeem),
        securityId,
      );

      const amortizationId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.amortizationId,
        className: SetAmortizationCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });

      return Promise.resolve(new SetAmortizationCommandResponse(parseInt(amortizationId, 16), res.id!));
    } catch (error) {
      throw new SetAmortizationCommandError(error as Error);
    }
  }
}
