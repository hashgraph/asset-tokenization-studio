// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { CancelDividendCommand, CancelDividendCommandResponse } from "./CancelDividendCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { CancelDividendCommandError } from "./error/CancelDividendCommandError";

@CommandHandler(CancelDividendCommand)
export class CancelDividendCommandHandler implements ICommandHandler<CancelDividendCommand> {
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

  async execute(command: CancelDividendCommand): Promise<CancelDividendCommandResponse> {
    try {
      const { securityId, dividendId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(SecurityRole._CORPORATEACTIONS_ROLE, account.evmAddress!, securityId);

      const res = await handler.cancelDividend(securityEvmAddress, dividendId, securityId);

      return new CancelDividendCommandResponse(res.error === undefined, res.id!);
    } catch (error) {
      throw new CancelDividendCommandError(error as Error);
    }
  }
}
