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
  ProtectedCreateHoldByPartitionCommand,
  ProtectedCreateHoldByPartitionCommandResponse,
} from "./ProtectedCreateHoldByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ProtectedCreateHoldByPartitionCommandError } from "./error/ProtectedCreateHoldByPartitionCommandError";

@CommandHandler(ProtectedCreateHoldByPartitionCommand)
export class ProtectedCreateHoldByPartitionCommandHandler
  implements ICommandHandler<ProtectedCreateHoldByPartitionCommand>
{
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(
    command: ProtectedCreateHoldByPartitionCommand,
  ): Promise<ProtectedCreateHoldByPartitionCommandResponse> {
    try {
      const {
        securityId,
        partitionId,
        escrowId,
        amount,
        sourceId,
        targetId,
        expirationDate,
        deadline,
        nonce,
        signature,
      } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const escrowEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(escrowId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddressOrNull(targetId);
      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkProtectedPartitions(security);

      await this.validationService.checkClearingDeactivated(securityId);

      await this.validationService.checkProtectedPartitionRole(partitionId, account.id.toString(), securityId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkBalance(securityId, sourceId, amountBd);

      await this.validationService.checkValidNounce(securityId, sourceId, nonce);

      const res = await handler.protectedCreateHoldByPartition(
        securityEvmAddress,
        partitionId,
        amountBd,
        escrowEvmAddress,
        sourceEvmAddress,
        targetEvmAddress,
        BigDecimal.fromString(expirationDate.substring(0, 10)),
        BigDecimal.fromString(deadline.substring(0, 10)),
        BigDecimal.fromString(nonce.toString()),
        signature,
        securityId,
      );

      const holdId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.holdId,
        className: ProtectedCreateHoldByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(new ProtectedCreateHoldByPartitionCommandResponse(parseInt(holdId, 16), res.id!));
    } catch (error) {
      throw new ProtectedCreateHoldByPartitionCommandError(error as Error);
    }
  }
}
