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
  ControllerCreateHoldByPartitionCommand,
  ControllerCreateHoldByPartitionCommandResponse,
} from "./ControllerCreateHoldByPartitionCommand";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ControllerCreateHoldByPartitionCommandError } from "./error/ControllerCreateHoldByPartitionCommandError";

@CommandHandler(ControllerCreateHoldByPartitionCommand)
export class ControllerCreateHoldByPartitionCommandHandler
  implements ICommandHandler<ControllerCreateHoldByPartitionCommand>
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
    command: ControllerCreateHoldByPartitionCommand,
  ): Promise<ControllerCreateHoldByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, escrowId, amount, sourceId, targetId, expirationDate } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const escrowEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(escrowId);

      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddressOrNull(targetId);
      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkClearingDeactivated(securityId);

      await this.validationService.checkRole(SecurityRole._CONTROLLER_ROLE, account.id.toString(), securityId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkBalance(securityId, sourceId, amountBd);

      const res = await handler.controllerCreateHoldByPartition(
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
        className: ControllerCreateHoldByPartitionCommandHandler.name,
        position: 1,
        numberOfResultsItems: 2,
      });

      return Promise.resolve(new ControllerCreateHoldByPartitionCommandResponse(parseInt(holdId, 16), res.id!));
    } catch (error) {
      throw new ControllerCreateHoldByPartitionCommandError(error as Error);
    }
  }
}
