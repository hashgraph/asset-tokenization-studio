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
  CreateHoldFromByPartitionCommand,
  CreateHoldFromByPartitionCommandResponse,
} from "./CreateHoldFromByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { CreateHoldFromByPartitionCommandError } from "./error/CreateHoldFromByPartitionCommandError";

@CommandHandler(CreateHoldFromByPartitionCommand)
export class CreateHoldFromByPartitionCommandHandler implements ICommandHandler<CreateHoldFromByPartitionCommand> {
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

  async execute(command: CreateHoldFromByPartitionCommand): Promise<CreateHoldFromByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, escrowId, amount, sourceId, targetId, expirationDate } = command;
      const handler = this.transactionService.getHandler();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const escrowEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(escrowId);

      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddressOrNull(targetId);
      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkClearingDeactivated(securityId);

      await this.validationService.checkBalance(securityId, sourceId, amountBd);

      const res = await handler.createHoldFromByPartition(
        securityEvmAddress,
        partitionId,
        escrowEvmAddress,
        amountBd,
        sourceEvmAddress,
        targetEvmAddress,
        BigDecimal.fromString(expirationDate.substring(0, 10)),
        securityId,
      );

      const holdId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.holdId,
        className: CreateHoldFromByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(new CreateHoldFromByPartitionCommandResponse(parseInt(holdId, 16), res.id!));
    } catch (error) {
      throw new CreateHoldFromByPartitionCommandError(error as Error);
    }
  }
}
