// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  ApproveClearingOperationByPartitionCommand,
  ApproveClearingOperationByPartitionCommandResponse,
} from "./ApproveClearingOperationByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import SecurityService from "@service/security/SecurityService";
import ContractService from "@service/contract/ContractService";
import { ApproveClearingOperationByPartitionCommandError } from "./error/ApproveClearingOperationByPartitionCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(ApproveClearingOperationByPartitionCommand)
export class ApproveClearingOperationByPartitionCommandHandler
  implements ICommandHandler<ApproveClearingOperationByPartitionCommand>
{
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(
    command: ApproveClearingOperationByPartitionCommand,
  ): Promise<ApproveClearingOperationByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, targetId, clearingId, clearingOperationType } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkClearingActivated(securityId);

      await this.validationService.checkKycAddresses(securityId, [targetId], KycStatus.GRANTED);

      await this.validationService.checkRole(SecurityRole._CLEARING_VALIDATOR_ROLE, account.id.toString(), securityId);

      await this.validationService.checkControlList(securityId, targetEvmAddress.toString());

      await this.validationService.checkMultiPartition(security, partitionId);

      const res = await handler.approveClearingOperationByPartition(
        securityEvmAddress,
        partitionId,
        targetEvmAddress,
        clearingId,
        clearingOperationType,
        securityId,
      );

      return Promise.resolve(new ApproveClearingOperationByPartitionCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ApproveClearingOperationByPartitionCommandError(error as Error);
    }
  }
}
