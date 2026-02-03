// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { BatchUnfreezePartialTokensCommandError } from "./error/BatchUnfreezePartialTokensCommandError";
import {
  BatchUnfreezePartialTokensCommand,
  BatchUnfreezePartialTokensResponse,
} from "./BatchUnfreezePartialTokensCommand";
import BigDecimal from "@domain/context/shared/BigDecimal";
import SecurityService from "@service/security/SecurityService";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(BatchUnfreezePartialTokensCommand)
export class BatchUnfreezePartialTokensCommandHandler implements ICommandHandler<BatchUnfreezePartialTokensCommand> {
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

  async execute(command: BatchUnfreezePartialTokensCommand): Promise<BatchUnfreezePartialTokensResponse> {
    try {
      const { securityId, amountList, targetList } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkClearingDeactivated(securityId);

      const security = await this.securityService.get(securityId);

      await this.validationService.checkKycAddresses(securityId, [account.id.toString()], KycStatus.GRANTED);

      for (let i = 0; i < amountList.length; i++) {
        await this.validationService.checkKycAddresses(securityId, [targetList[i]], KycStatus.GRANTED);
        await this.validationService.checkDecimals(security, amountList[i]);
      }

      const evmAddresses = await Promise.all(
        targetList.map(async (targetId) => await this.accountService.getAccountEvmAddress(targetId)),
      );
      const bdList = amountList.map((amount) => BigDecimal.fromString(amount, security.decimals));
      const res = await handler.batchUnfreezePartialTokens(securityEvmAddress, bdList, evmAddresses, securityId);

      return Promise.resolve(new BatchUnfreezePartialTokensResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new BatchUnfreezePartialTokensCommandError(error as Error);
    }
  }
}
