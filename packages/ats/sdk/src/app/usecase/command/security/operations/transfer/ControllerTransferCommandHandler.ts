// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { ControllerTransferCommand, ControllerTransferCommandResponse } from "./ControllerTransferCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { ControllerTransferCommandError } from "./error/ControllerTransferCommandError";

@CommandHandler(ControllerTransferCommand)
export class ControllerTransferCommandHandler implements ICommandHandler<ControllerTransferCommand> {
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

  async execute(command: ControllerTransferCommand): Promise<ControllerTransferCommandResponse> {
    try {
      const { securityId, targetId, sourceId, amount } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkCanTransfer(securityId, targetId, amount, account.id.toString(), sourceId);

      await this.validationService.checkDecimals(security, amount);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      const res = await handler.controllerTransfer(
        securityEvmAddress,
        sourceEvmAddress,
        targetEvmAddress,
        amountBd,
        securityId,
      );
      return Promise.resolve(new ControllerTransferCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ControllerTransferCommandError(error as Error);
    }
  }
}
