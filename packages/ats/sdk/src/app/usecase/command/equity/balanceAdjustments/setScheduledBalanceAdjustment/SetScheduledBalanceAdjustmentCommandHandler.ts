// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import {
  SetScheduledBalanceAdjustmentCommand,
  SetScheduledBalanceAdjustmentCommandResponse,
} from "./SetScheduledBalanceAdjustmentCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { SetScheduledBalanceAdjustmentCommandError } from "./error/SetScheduledBalanceAdjustmentCommandError";

@CommandHandler(SetScheduledBalanceAdjustmentCommand)
export class SetScheduledBalanceAdjustmentCommandHandler
  implements ICommandHandler<SetScheduledBalanceAdjustmentCommand>
{
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

  async execute(command: SetScheduledBalanceAdjustmentCommand): Promise<SetScheduledBalanceAdjustmentCommandResponse> {
    try {
      const { securityId, executionDate, factor, decimals } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._CORPORATEACTIONS_ROLE, account.evmAddress!, securityId);

      const res = await handler.setScheduledBalanceAdjustment(
        securityEvmAddress,
        BigDecimal.fromString(executionDate),
        BigDecimal.fromString(factor),
        BigDecimal.fromString(decimals),
        securityId,
      );

      const balanceAdjustmentId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.balanceAdjustmentID,
        className: SetScheduledBalanceAdjustmentCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });

      return Promise.resolve(
        new SetScheduledBalanceAdjustmentCommandResponse(parseInt(balanceAdjustmentId, 16), res.id!),
      );
    } catch (error) {
      throw new SetScheduledBalanceAdjustmentCommandError(error as Error);
    }
  }
}
