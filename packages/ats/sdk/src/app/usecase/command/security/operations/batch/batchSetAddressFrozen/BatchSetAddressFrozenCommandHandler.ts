// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { BatchSetAddressFrozenCommandError } from "./error/BatchSetAddressFrozenCommandError";
import { BatchSetAddressFrozenCommand, BatchSetAddressFrozenResponse } from "./BatchSetAddressFrozenCommand";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(BatchSetAddressFrozenCommand)
export class BatchSetAddressFrozenCommandHandler implements ICommandHandler<BatchSetAddressFrozenCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: BatchSetAddressFrozenCommand): Promise<BatchSetAddressFrozenResponse> {
    try {
      const { securityId, freezeStatusList, targetList } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkClearingDeactivated(securityId);

      await this.validationService.checkKycAddresses(securityId, [account.id.toString()], KycStatus.GRANTED);

      for (let i = 0; i < targetList.length; i++) {
        await this.validationService.checkKycAddresses(securityId, [targetList[i]], KycStatus.GRANTED);
      }

      const evmAddresses = await Promise.all(
        targetList.map(async (targetId) => await this.accountService.getAccountEvmAddress(targetId)),
      );

      const res = await handler.batchSetAddressFrozen(securityEvmAddress, freezeStatusList, evmAddresses, securityId);

      return Promise.resolve(new BatchSetAddressFrozenResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new BatchSetAddressFrozenCommandError(error as Error);
    }
  }
}
