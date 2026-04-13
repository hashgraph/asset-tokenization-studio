// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { CancelAmortizationCommand, CancelAmortizationCommandResponse } from "./CancelAmortizationCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { CancelAmortizationCommandError } from "./error/CancelAmortizationCommandError";

@CommandHandler(CancelAmortizationCommand)
export class CancelAmortizationCommandHandler implements ICommandHandler<CancelAmortizationCommand> {
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

  async execute(command: CancelAmortizationCommand): Promise<CancelAmortizationCommandResponse> {
    try {
      const { securityId, amortizationId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(SecurityRole._CORPORATEACTIONS_ROLE, account.evmAddress!, securityId);

      const res = await handler.cancelAmortization(securityEvmAddress, amortizationId, securityId);

      return new CancelAmortizationCommandResponse(res.error === undefined, res.id!);
    } catch (error) {
      throw new CancelAmortizationCommandError(error as Error);
    }
  }
}
