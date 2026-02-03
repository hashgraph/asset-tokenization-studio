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
  ClearingRedeemFromByPartitionCommand,
  ClearingRedeemFromByPartitionCommandResponse,
} from "./ClearingRedeemFromByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ClearingRedeemFromByPartitionCommandError } from "./error/ClearingRedeemFromByPartitionCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(ClearingRedeemFromByPartitionCommand)
export class ClearingRedeemFromByPartitionCommandHandler
  implements ICommandHandler<ClearingRedeemFromByPartitionCommand>
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

  async execute(command: ClearingRedeemFromByPartitionCommand): Promise<ClearingRedeemFromByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, amount, sourceId, expirationDate } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const amountBd = BigDecimal.fromString(amount, security.decimals);

      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkClearingActivated(securityId);

      await this.validationService.checkKycAddresses(securityId, [account.id.toString(), sourceId], KycStatus.GRANTED);

      await this.validationService.checkControlList(securityId, account.evmAddress, sourceEvmAddress.toString());

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkBalance(securityId, sourceId, amountBd);

      const res = await handler.clearingRedeemFromByPartition(
        securityEvmAddress,
        partitionId,
        amountBd,
        sourceEvmAddress,
        BigDecimal.fromString(expirationDate.substring(0, 10)),
        securityId,
      );

      const clearingId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.clearingId,
        className: ClearingRedeemFromByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(new ClearingRedeemFromByPartitionCommandResponse(parseInt(clearingId, 16), res.id!));
    } catch (error) {
      throw new ClearingRedeemFromByPartitionCommandError(error as Error);
    }
  }
}
