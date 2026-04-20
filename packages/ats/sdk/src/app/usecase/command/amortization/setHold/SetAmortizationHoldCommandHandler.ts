// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { SetAmortizationHoldCommand, SetAmortizationHoldCommandResponse } from "./SetAmortizationHoldCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { SetAmortizationHoldCommandError } from "./error/SetAmortizationHoldCommandError";

@CommandHandler(SetAmortizationHoldCommand)
export class SetAmortizationHoldCommandHandler implements ICommandHandler<SetAmortizationHoldCommand> {
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

  async execute(command: SetAmortizationHoldCommand): Promise<SetAmortizationHoldCommandResponse> {
    try {
      const { securityId, amortizationId, tokenHolder, tokenAmount } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const tokenHolderEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(tokenHolder);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(SecurityRole._AMORTIZATION_ROLE, account.evmAddress!, securityId);

      const res = await handler.setAmortizationHold(
        securityEvmAddress,
        amortizationId,
        tokenHolderEvmAddress,
        BigDecimal.fromString(tokenAmount),
        securityId,
      );

      const holdId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.holdId,
        className: SetAmortizationHoldCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });

      return Promise.resolve(new SetAmortizationHoldCommandResponse(parseInt(holdId, 16), res.id!));
    } catch (error) {
      throw new SetAmortizationHoldCommandError(error as Error);
    }
  }
}
