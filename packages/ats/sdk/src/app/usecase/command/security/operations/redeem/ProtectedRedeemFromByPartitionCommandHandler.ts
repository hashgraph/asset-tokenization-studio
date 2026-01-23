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
  ProtectedRedeemFromByPartitionCommand,
  ProtectedRedeemFromByPartitionCommandResponse,
} from "./ProtectedRedeemFromByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ProtectedRedeemFromByPartitionCommandError } from "./error/ProtectedRedeemFromByPartitionCommandError";

@CommandHandler(ProtectedRedeemFromByPartitionCommand)
export class ProtectedRedeemFromByPartitionCommandHandler
  implements ICommandHandler<ProtectedRedeemFromByPartitionCommand>
{
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(
    command: ProtectedRedeemFromByPartitionCommand,
  ): Promise<ProtectedRedeemFromByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, sourceId, amount, deadline, nounce, signature } = command;

      const handler = this.transactionService.getHandler();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkCanRedeem(securityId, sourceId, amount, partitionId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkValidNounce(securityId, sourceId, nounce);

      const res = await handler.protectedRedeemFromByPartition(
        securityEvmAddress,
        partitionId,
        sourceEvmAddress,
        amountBd,
        BigDecimal.fromString(deadline.substring(0, 10)),
        BigDecimal.fromString(nounce.toString()),
        signature,
        command.securityId,
      );
      return Promise.resolve(new ProtectedRedeemFromByPartitionCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ProtectedRedeemFromByPartitionCommandError(error as Error);
    }
  }
}
