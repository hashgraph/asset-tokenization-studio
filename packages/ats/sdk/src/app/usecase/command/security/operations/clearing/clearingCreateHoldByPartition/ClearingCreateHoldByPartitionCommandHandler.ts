// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  ClearingCreateHoldByPartitionCommand,
  ClearingCreateHoldByPartitionCommandResponse,
} from "./ClearingCreateHoldByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ClearingCreateHoldByPartitionCommandError } from "./error/ClearingCreateHoldByPartitionCommandError";

@CommandHandler(ClearingCreateHoldByPartitionCommand)
export class ClearingCreateHoldByPartitionCommandHandler
  implements ICommandHandler<ClearingCreateHoldByPartitionCommand>
{
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: ClearingCreateHoldByPartitionCommand): Promise<ClearingCreateHoldByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, escrowId, amount, targetId, clearingExpirationDate, holdExpirationDate } =
        command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const escrowEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(escrowId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddressOrNull(targetId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkClearingActivated(securityId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkBalance(securityId, account.id.toString(), amountBd);
      const res = await handler.clearingCreateHoldByPartition(
        securityEvmAddress,
        partitionId,
        escrowEvmAddress,
        amountBd,
        targetEvmAddress,
        BigDecimal.fromString(clearingExpirationDate.substring(0, 10)),
        BigDecimal.fromString(holdExpirationDate.substring(0, 10)),
        securityId,
      );

      const clearingId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.clearingId,
        className: ClearingCreateHoldByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(new ClearingCreateHoldByPartitionCommandResponse(parseInt(clearingId, 16), res.id!));
    } catch (error) {
      throw new ClearingCreateHoldByPartitionCommandError(error as Error);
    }
  }
}
