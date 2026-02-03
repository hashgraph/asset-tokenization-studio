// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { SetSymbolCommand, SetSymbolCommandResponse } from "./SetSymbolCommand";
import { SetSymbolCommandError } from "./error/SetSymbolCommandError";

@CommandHandler(SetSymbolCommand)
export class SetSymbolCommandHandler implements ICommandHandler<SetSymbolCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: SetSymbolCommand): Promise<SetSymbolCommandResponse> {
    try {
      const { securityId, symbol } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._TREX_OWNER_ROLE, account.id.toString(), securityId);

      const res = await handler.setSymbol(securityEvmAddress, symbol, securityId);

      return Promise.resolve(new SetSymbolCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new SetSymbolCommandError(error as Error);
    }
  }
}
