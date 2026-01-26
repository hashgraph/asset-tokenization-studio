// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  ReclaimClearingOperationByPartitionCommand,
  ReclaimClearingOperationByPartitionCommandResponse,
} from "./ReclaimClearingOperationByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ReclaimClearingOperationByPartitionCommandError } from "./error/ReclaimClearingOperationByPartitionCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(ReclaimClearingOperationByPartitionCommand)
export class ReclaimClearingOperationByPartitionCommandHandler
  implements ICommandHandler<ReclaimClearingOperationByPartitionCommand>
{
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(
    command: ReclaimClearingOperationByPartitionCommand,
  ): Promise<ReclaimClearingOperationByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, targetId, clearingId, clearingOperationType } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkClearingActivated(securityId);
      await this.validationService.checkKycAddresses(securityId, [targetId], KycStatus.GRANTED);

      const res = await handler.reclaimClearingOperationByPartition(
        securityEvmAddress,
        partitionId,
        targetEvmAddress,
        clearingId,
        clearingOperationType,
        securityId,
      );

      return Promise.resolve(new ReclaimClearingOperationByPartitionCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ReclaimClearingOperationByPartitionCommandError(error as Error);
    }
  }
}
