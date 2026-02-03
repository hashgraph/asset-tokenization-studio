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
  ClearingRedeemByPartitionCommand,
  ClearingRedeemByPartitionCommandResponse,
} from "./ClearingRedeemByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ClearingRedeemByPartitionCommandError } from "./error/ClearingRedeemByPartitionCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(ClearingRedeemByPartitionCommand)
export class ClearingRedeemByPartitionCommandHandler implements ICommandHandler<ClearingRedeemByPartitionCommand> {
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

  async execute(command: ClearingRedeemByPartitionCommand): Promise<ClearingRedeemByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, amount, expirationDate } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkClearingActivated(securityId);

      await this.validationService.checkKycAddresses(securityId, [account.id.toString()], KycStatus.GRANTED);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkBalance(securityId, account.id.toString(), amountBd);

      const res = await handler.clearingRedeemByPartition(
        securityEvmAddress,
        partitionId,
        amountBd,
        BigDecimal.fromString(expirationDate.substring(0, 10)),
        securityId,
      );

      const clearingId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.clearingId,
        className: ClearingRedeemByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(new ClearingRedeemByPartitionCommandResponse(parseInt(clearingId, 16), res.id!));
    } catch (error) {
      throw new ClearingRedeemByPartitionCommandError(error as Error);
    }
  }
}
