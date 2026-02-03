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
  ClearingTransferFromByPartitionCommand,
  ClearingTransferFromByPartitionCommandResponse,
} from "./ClearingTransferFromByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ClearingTransferFromByPartitionCommandError } from "./error/ClearingTransferFromByPartitionCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(ClearingTransferFromByPartitionCommand)
export class ClearingTransferFromByPartitionCommandHandler
  implements ICommandHandler<ClearingTransferFromByPartitionCommand>
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
    command: ClearingTransferFromByPartitionCommand,
  ): Promise<ClearingTransferFromByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, amount, sourceId, targetId, expirationDate } = command;
      const handler = this.transactionService.getHandler();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkClearingActivated(securityId);
      await this.validationService.checkKycAddresses(securityId, [sourceId, targetId], KycStatus.GRANTED);

      await this.validationService.checkControlList(
        securityId,
        sourceEvmAddress.toString(),
        targetEvmAddress.toString(),
      );

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkBalance(securityId, sourceId, amountBd);

      const res = await handler.clearingTransferFromByPartition(
        securityEvmAddress,
        partitionId,
        amountBd,
        sourceEvmAddress,
        targetEvmAddress,
        BigDecimal.fromString(expirationDate.substring(0, 10)),
        securityId,
      );

      const clearingId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.clearingId,
        className: ClearingTransferFromByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(new ClearingTransferFromByPartitionCommandResponse(parseInt(clearingId, 16), res.id!));
    } catch (error) {
      throw new ClearingTransferFromByPartitionCommandError(error as Error);
    }
  }
}
