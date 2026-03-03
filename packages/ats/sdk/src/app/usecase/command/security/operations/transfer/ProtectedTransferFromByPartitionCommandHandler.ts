// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import {
  ProtectedTransferFromByPartitionCommand,
  ProtectedTransferFromByPartitionCommandResponse,
} from "./ProtectedTransferFromByPartitionCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { KycStatus } from "@domain/context/kyc/Kyc";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ProtectedTransferFromByPartitionCommandError } from "./error/ProtectedTransferFromByPartitionCommandError";

@CommandHandler(ProtectedTransferFromByPartitionCommand)
export class ProtectedTransferFromByPartitionCommandHandler
  implements ICommandHandler<ProtectedTransferFromByPartitionCommand>
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
    command: ProtectedTransferFromByPartitionCommand,
  ): Promise<ProtectedTransferFromByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, sourceId, targetId, amount, deadline, nounce, signature } = command;

      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);
      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkProtectedPartitions(security);

      await this.validationService.checkProtectedPartitionRole(partitionId, account.id.toString(), securityId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkKycAddresses(securityId, [sourceId, targetId], KycStatus.GRANTED);

      await this.validationService.checkControlList(
        securityId,
        sourceEvmAddress.toString(),
        targetEvmAddress.toString(),
      );

      await this.validationService.checkBalance(securityId, sourceId, amountBd);

      await this.validationService.checkValidNounce(securityId, sourceId, nounce);

      const res = await handler.protectedTransferFromByPartition(
        securityEvmAddress,
        partitionId,
        sourceEvmAddress,
        targetEvmAddress,
        amountBd,
        BigDecimal.fromString(deadline.substring(0, 10)),
        BigDecimal.fromString(nounce.toString()),
        signature,
        securityId,
      );

      return Promise.resolve(new ProtectedTransferFromByPartitionCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ProtectedTransferFromByPartitionCommandError(error as Error);
    }
  }
}
