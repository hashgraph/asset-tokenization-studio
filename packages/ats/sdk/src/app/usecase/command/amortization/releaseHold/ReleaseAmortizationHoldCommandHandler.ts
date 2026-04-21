// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import {
  ReleaseAmortizationHoldCommand,
  ReleaseAmortizationHoldCommandResponse,
} from "./ReleaseAmortizationHoldCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ReleaseAmortizationHoldCommandError } from "./error/ReleaseAmortizationHoldCommandError";

@CommandHandler(ReleaseAmortizationHoldCommand)
export class ReleaseAmortizationHoldCommandHandler implements ICommandHandler<ReleaseAmortizationHoldCommand> {
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

  async execute(command: ReleaseAmortizationHoldCommand): Promise<ReleaseAmortizationHoldCommandResponse> {
    try {
      const { securityId, amortizationId, tokenHolder } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const tokenHolderEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(tokenHolder);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(SecurityRole._AMORTIZATION_ROLE, account.evmAddress!, securityId);

      const res = await handler.releaseAmortizationHold(
        securityEvmAddress,
        amortizationId,
        tokenHolderEvmAddress,
        securityId,
      );

      return new ReleaseAmortizationHoldCommandResponse(res.error === undefined, res.id!);
    } catch (error) {
      throw new ReleaseAmortizationHoldCommandError(error as Error);
    }
  }
}
