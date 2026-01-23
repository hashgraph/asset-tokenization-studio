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
  ProtectedClearingTransferByPartitionCommand,
  ProtectedClearingTransferByPartitionCommandResponse,
} from "./ProtectedClearingTransferByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ProtectedClearingTransferByPartitionCommandError } from "./error/ProtectedClearingTransferByPartitionCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(ProtectedClearingTransferByPartitionCommand)
export class ProtectedClearingTransferByPartitionCommandHandler
  implements ICommandHandler<ProtectedClearingTransferByPartitionCommand>
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
    command: ProtectedClearingTransferByPartitionCommand,
  ): Promise<ProtectedClearingTransferByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, amount, sourceId, targetId, expirationDate, deadline, nonce, signature } =
        command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkClearingActivated(securityId);
      await this.validationService.checkKycAddresses(securityId, [sourceId, targetId], KycStatus.GRANTED);

      await this.validationService.checkProtectedPartitions(security);

      await this.validationService.checkProtectedPartitionRole(partitionId, account.id.toString(), securityId);

      await this.validationService.checkControlList(
        securityId,
        sourceEvmAddress.toString(),
        targetEvmAddress.toString(),
      );

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkBalance(securityId, sourceId, amountBd);

      await this.validationService.checkValidNounce(securityId, sourceId, nonce);

      const res = await handler.protectedClearingTransferByPartition(
        securityEvmAddress,
        partitionId,
        amountBd,
        sourceEvmAddress,
        targetEvmAddress,
        BigDecimal.fromString(expirationDate.substring(0, 10)),
        BigDecimal.fromString(deadline.substring(0, 10)),
        BigDecimal.fromString(nonce.toString()),
        signature,
        securityId,
      );

      const clearingId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.clearingId,
        className: ProtectedClearingTransferByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(
        new ProtectedClearingTransferByPartitionCommandResponse(parseInt(clearingId, 16), res.id!),
      );
    } catch (error) {
      throw new ProtectedClearingTransferByPartitionCommandError(error as Error);
    }
  }
}
