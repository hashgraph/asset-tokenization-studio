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
  OperatorClearingCreateHoldByPartitionCommand,
  OperatorClearingCreateHoldByPartitionCommandResponse,
} from "./OperatorClearingCreateHoldByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { OperatorClearingCreateHoldByPartitionCommandError } from "./error/OperatorClearingCreateHoldByPartitionCommandError";

@CommandHandler(OperatorClearingCreateHoldByPartitionCommand)
export class OperatorClearingCreateHoldByPartitionCommandHandler
  implements ICommandHandler<OperatorClearingCreateHoldByPartitionCommand>
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

  async execute(
    command: OperatorClearingCreateHoldByPartitionCommand,
  ): Promise<OperatorClearingCreateHoldByPartitionCommandResponse> {
    try {
      const {
        securityId,
        partitionId,
        escrowId,
        amount,
        sourceId,
        targetId,
        clearingExpirationDate,
        holdExpirationDate,
      } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkPause(securityId);

      await this.validationService.checkOperator(securityId, partitionId, account.id.toString(), sourceId);
      await this.validationService.checkClearingActivated(securityId);

      await this.validationService.checkDecimals(security, amount);

      const escrowEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(escrowId);

      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddressOrNull(targetId);
      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkBalance(securityId, sourceId, amountBd);

      const res = await handler.operatorClearingCreateHoldByPartition(
        securityEvmAddress,
        partitionId,
        escrowEvmAddress,
        amountBd,
        sourceEvmAddress,
        targetEvmAddress,
        BigDecimal.fromString(clearingExpirationDate.substring(0, 10)),
        BigDecimal.fromString(holdExpirationDate.substring(0, 10)),
        securityId,
      );

      const clearingId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.clearingId,
        className: OperatorClearingCreateHoldByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(
        new OperatorClearingCreateHoldByPartitionCommandResponse(parseInt(clearingId, 16), res.id!),
      );
    } catch (error) {
      throw new OperatorClearingCreateHoldByPartitionCommandError(error as Error);
    }
  }
}
