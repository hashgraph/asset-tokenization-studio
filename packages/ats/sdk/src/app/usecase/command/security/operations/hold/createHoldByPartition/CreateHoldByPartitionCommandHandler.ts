// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { CreateHoldByPartitionCommand, CreateHoldByPartitionCommandResponse } from "./CreateHoldByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { CreateHoldByPartitionCommandError } from "./error/CreateHoldByPartitionCommandError";

@CommandHandler(CreateHoldByPartitionCommand)
export class CreateHoldByPartitionCommandHandler implements ICommandHandler<CreateHoldByPartitionCommand> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: CreateHoldByPartitionCommand): Promise<CreateHoldByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, escrowId, amount, targetId, expirationDate } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      await this.validationService.checkClearingDeactivated(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const escrowEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(escrowId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddressOrNull(targetId);
      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkBalance(securityId, account.id.toString(), amountBd);

      const res = await handler.createHoldByPartition(
        securityEvmAddress,
        partitionId,
        escrowEvmAddress,
        amountBd,
        targetEvmAddress,
        BigDecimal.fromString(expirationDate.substring(0, 10)),
        securityId,
      );

      const holdId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.holdId,
        className: CreateHoldByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(new CreateHoldByPartitionCommandResponse(parseInt(holdId, 16), res.id!));
    } catch (error) {
      throw new CreateHoldByPartitionCommandError(error as Error);
    }
  }
}
