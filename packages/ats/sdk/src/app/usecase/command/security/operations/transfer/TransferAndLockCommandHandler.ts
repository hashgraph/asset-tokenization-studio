// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { TransferAndLockCommand, TransferAndLockCommandResponse } from "./TransferAndLockCommand";
import TransactionService from "@service/transaction/TransactionService";
import ValidationService from "@service/validation/ValidationService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { TransferAndLockCommandError } from "./error/TransferAndLockCommandError";

@CommandHandler(TransferAndLockCommand)
export class TransferAndLockCommandHandler implements ICommandHandler<TransferAndLockCommand> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: TransferAndLockCommand): Promise<TransferAndLockCommandResponse> {
    try {
      const { securityId, targetId, amount, expirationDate } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const security = await this.securityService.get(securityId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkCanTransfer(securityId, targetId, amount, account.id.toString());

      const amountBd: BigDecimal = BigDecimal.fromString(amount, security.decimals);

      const res = await handler.transferAndLock(
        securityEvmAddress,
        targetEvmAddress,
        amountBd,
        BigDecimal.fromString(expirationDate.substring(0, 10)),
        securityId,
      );

      const lockId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.lockId,
        className: TransferAndLockCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(new TransferAndLockCommandResponse(parseInt(lockId, 16), res.id!));
    } catch (error) {
      throw new TransferAndLockCommandError(error as Error);
    }
  }
}
