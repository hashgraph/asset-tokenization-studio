// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { BatchForcedTransferCommandError } from "./error/BatchForcedTransferCommandError";
import { BatchForcedTransferCommand, BatchForcedTransferResponse } from "./BatchForcedTransferCommand";
import BigDecimal from "@domain/context/shared/BigDecimal";
import SecurityService from "@service/security/SecurityService";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(BatchForcedTransferCommand)
export class BatchForcedTransferCommandHandler implements ICommandHandler<BatchForcedTransferCommand> {
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

  async execute(command: BatchForcedTransferCommand): Promise<BatchForcedTransferResponse> {
    try {
      const { securityId, amountList, toList, fromList } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkClearingDeactivated(securityId);

      const security = await this.securityService.get(securityId);

      await this.validationService.checkKycAddresses(securityId, [account.id.toString()], KycStatus.GRANTED);

      for (let i = 0; i < amountList.length; i++) {
        await this.validationService.checkKycAddresses(securityId, [toList[i]], KycStatus.GRANTED);
        await this.validationService.checkDecimals(security, amountList[i]);
      }

      const evmToAddresses = await Promise.all(
        toList.map(async (targetId) => await this.accountService.getAccountEvmAddress(targetId)),
      );
      const evmFromAddresses = await Promise.all(
        fromList.map(async (targetId) => await this.accountService.getAccountEvmAddress(targetId)),
      );
      const bdList = amountList.map((amount) => BigDecimal.fromString(amount, security.decimals));
      const res = await handler.batchForcedTransfer(
        securityEvmAddress,
        bdList,
        evmFromAddresses,
        evmToAddresses,
        securityId,
      );

      return Promise.resolve(new BatchForcedTransferResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new BatchForcedTransferCommandError(error as Error);
    }
  }
}
