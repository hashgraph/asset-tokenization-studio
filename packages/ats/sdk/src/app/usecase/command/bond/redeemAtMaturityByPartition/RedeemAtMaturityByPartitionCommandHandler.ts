// SPDX-License-Identifier: Apache-2.0

import {
  RedeemAtMaturityByPartitionCommand,
  RedeemAtMaturityByPartitionCommandResponse,
} from "./RedeemAtMaturityByPartitionCommand";
import { RedeemAtMaturityByPartitionCommandError } from "./error/RedeemAtMaturityByPartitionCommandError";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import SecurityService from "@service/security/SecurityService";
import ValidationService from "@service/validation/ValidationService";
import BigDecimal from "@domain/context/shared/BigDecimal";

@CommandHandler(RedeemAtMaturityByPartitionCommand)
export class RedeemAtMaturityByPartitionCommandHandler implements ICommandHandler<RedeemAtMaturityByPartitionCommand> {
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

  async execute(command: RedeemAtMaturityByPartitionCommand): Promise<RedeemAtMaturityByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, amount, sourceId } = command;
      const handler = this.transactionService.getHandler();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkCanRedeem(securityId, sourceId, amount, partitionId);

      await this.validationService.checkDecimals(security, amount);

      const res = await handler.redeemAtMaturityByPartition(
        securityEvmAddress,
        partitionId,
        sourceEvmAddress,
        amountBd,
        securityId,
      );
      return Promise.resolve(new RedeemAtMaturityByPartitionCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RedeemAtMaturityByPartitionCommandError(error as Error);
    }
  }
}
