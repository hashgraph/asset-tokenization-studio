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
  ClearingTransferByPartitionCommand,
  ClearingTransferByPartitionCommandResponse,
} from "./ClearingTransferByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ClearingTransferByPartitionCommandError } from "./error/ClearingTransferByPartitionCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(ClearingTransferByPartitionCommand)
export class ClearingTransferByPartitionCommandHandler implements ICommandHandler<ClearingTransferByPartitionCommand> {
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

  async execute(command: ClearingTransferByPartitionCommand): Promise<ClearingTransferByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, amount, targetId, expirationDate } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkClearingActivated(securityId);
      await this.validationService.checkKycAddresses(securityId, [account.id.toString(), targetId], KycStatus.GRANTED);

      await this.validationService.checkControlList(securityId, account.evmAddress, targetEvmAddress.toString());

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkBalance(securityId, account.id.toString(), amountBd);
      const res = await handler.clearingTransferByPartition(
        securityEvmAddress,
        partitionId,
        amountBd,
        targetEvmAddress,
        BigDecimal.fromString(expirationDate.substring(0, 10)),
        securityId,
      );

      const clearingId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.clearingId,
        className: ClearingTransferByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(new ClearingTransferByPartitionCommandResponse(parseInt(clearingId, 16), res.id!));
    } catch (error) {
      throw new ClearingTransferByPartitionCommandError(error as Error);
    }
  }
}
