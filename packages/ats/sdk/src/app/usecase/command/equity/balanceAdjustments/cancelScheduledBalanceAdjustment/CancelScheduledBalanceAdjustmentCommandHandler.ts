// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import {
  CancelScheduledBalanceAdjustmentCommand,
  CancelScheduledBalanceAdjustmentCommandResponse,
} from "./CancelScheduledBalanceAdjustmentCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { CancelScheduledBalanceAdjustmentCommandError } from "./error/CancelScheduledBalanceAdjustmentCommandError";

@CommandHandler(CancelScheduledBalanceAdjustmentCommand)
export class CancelScheduledBalanceAdjustmentCommandHandler implements ICommandHandler<CancelScheduledBalanceAdjustmentCommand> {
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

  async execute(
    command: CancelScheduledBalanceAdjustmentCommand,
  ): Promise<CancelScheduledBalanceAdjustmentCommandResponse> {
    try {
      const { securityId, balanceAdjustmentId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(SecurityRole._CORPORATEACTIONS_ROLE, account.evmAddress!, securityId);

      const res = await handler.cancelScheduledBalanceAdjustment(securityEvmAddress, balanceAdjustmentId, securityId);

      return Promise.resolve(new CancelScheduledBalanceAdjustmentCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new CancelScheduledBalanceAdjustmentCommandError(error as Error);
    }
  }
}
