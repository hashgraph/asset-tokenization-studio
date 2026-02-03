// SPDX-License-Identifier: Apache-2.0

import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { RecoveryAddressCommand, RecoveryAddressCommandResponse } from "./RecoveryAddressCommand";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import { RecoveryAddressCommandError } from "./error/RecoveryAddressCommandError";
import ContractService from "@service/contract/ContractService";

@CommandHandler(RecoveryAddressCommand)
export class RecoveryAddressCommandHandler implements ICommandHandler<RecoveryAddressCommand> {
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

  async execute(command: RecoveryAddressCommand): Promise<RecoveryAddressCommandResponse> {
    try {
      const { securityId, lostWalletId, newWalletId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const lostWalletEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(lostWalletId);
      const newWalletEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(newWalletId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._AGENT_ROLE, account.id.toString(), securityId);

      const res = await handler.recoveryAddress(
        securityEvmAddress,
        lostWalletEvmAddress,
        newWalletEvmAddress,
        securityId,
      );
      return Promise.resolve(new RecoveryAddressCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RecoveryAddressCommandError(error as Error);
    }
  }
}
