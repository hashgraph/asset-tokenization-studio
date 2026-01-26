// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import SecurityService from "@service/security/SecurityService";
import { ExecuteHoldByPartitionCommand, ExecuteHoldByPartitionCommandResponse } from "./ExecuteHoldByPartitionCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { KycStatus } from "@domain/context/kyc/Kyc";
import { ExecuteHoldByPartitionCommandError } from "./error/ExecuteHoldByPartitionCommandError";

@CommandHandler(ExecuteHoldByPartitionCommand)
export class ExecuteHoldByPartitionCommandHandler implements ICommandHandler<ExecuteHoldByPartitionCommand> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: ExecuteHoldByPartitionCommand): Promise<ExecuteHoldByPartitionCommandResponse> {
    try {
      const { securityId, sourceId, amount, holdId, targetId, partitionId } = command;

      const handler = this.transactionService.getHandler();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddressOrNull(targetId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkHoldBalance(securityId, partitionId, sourceId, holdId, amountBd);

      await this.validationService.checkKycAddresses(securityId, [sourceId, targetId], KycStatus.GRANTED);

      const res = await handler.executeHoldByPartition(
        securityEvmAddress,
        sourceEvmAddress,
        targetEvmAddress,
        amountBd,
        partitionId,
        holdId,
        securityId,
      );

      return Promise.resolve(new ExecuteHoldByPartitionCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ExecuteHoldByPartitionCommandError(error as Error);
    }
  }
}
