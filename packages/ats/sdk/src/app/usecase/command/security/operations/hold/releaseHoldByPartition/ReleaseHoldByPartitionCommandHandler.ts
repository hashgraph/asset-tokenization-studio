// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import SecurityService from "@service/security/SecurityService";
import { ReleaseHoldByPartitionCommand, ReleaseHoldByPartitionCommandResponse } from "./ReleaseHoldByPartitionCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { ReleaseHoldByPartitionCommandError } from "./error/ReleaseHoldByPartitionCommandError";

@CommandHandler(ReleaseHoldByPartitionCommand)
export class ReleaseHoldByPartitionCommandHandler implements ICommandHandler<ReleaseHoldByPartitionCommand> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: ReleaseHoldByPartitionCommand): Promise<ReleaseHoldByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, amount, holdId, targetId } = command;
      const handler = this.transactionService.getHandler();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkHoldBalance(securityId, partitionId, targetId, holdId, amountBd);

      const res = await handler.releaseHoldByPartition(
        securityEvmAddress,
        partitionId,
        holdId,
        targetEvmAddress,
        amountBd,
        securityId,
      );

      return Promise.resolve(new ReleaseHoldByPartitionCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ReleaseHoldByPartitionCommandError(error as Error);
    }
  }
}
