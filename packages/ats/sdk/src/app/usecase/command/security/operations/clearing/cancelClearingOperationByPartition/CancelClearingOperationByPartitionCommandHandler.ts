// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  CancelClearingOperationByPartitionCommand,
  CancelClearingOperationByPartitionCommandResponse,
} from "./CancelClearingOperationByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import { CancelClearingOperationByPartitionCommandError } from "./error/CancelClearingOperationByPartitionCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(CancelClearingOperationByPartitionCommand)
export class CancelClearingOperationByPartitionCommandHandler
  implements ICommandHandler<CancelClearingOperationByPartitionCommand>
{
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

  async execute(
    command: CancelClearingOperationByPartitionCommand,
  ): Promise<CancelClearingOperationByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, targetId, clearingId, clearingOperationType } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkClearingActivated(securityId);

      await this.validationService.checkKycAddresses(securityId, [targetId], KycStatus.GRANTED);

      await this.validationService.checkRole(SecurityRole._CLEARING_VALIDATOR_ROLE, account.id.toString(), securityId);

      const res = await handler.cancelClearingOperationByPartition(
        securityEvmAddress,
        partitionId,
        targetEvmAddress,
        clearingId,
        clearingOperationType,
        securityId,
      );

      return Promise.resolve(new CancelClearingOperationByPartitionCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new CancelClearingOperationByPartitionCommandError(error as Error);
    }
  }
}
