// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { TransferCommand, TransferCommandResponse } from "./TransferCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { TransferCommandError } from "./error/TransferCommandError";

@CommandHandler(TransferCommand)
export class TransferCommandHandler implements ICommandHandler<TransferCommand> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: TransferCommand): Promise<TransferCommandResponse> {
    try {
      const { securityId, targetId, amount } = command;

      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();
      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const security = await this.securityService.get(securityId);

      await this.validationService.checkCanTransfer(securityId, targetId, amount, account.id.toString());

      const amountBd: BigDecimal = BigDecimal.fromString(amount, security.decimals);

      const res = await handler.transfer(securityEvmAddress, targetEvmAddress, amountBd, securityId);
      return Promise.resolve(new TransferCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new TransferCommandError(error as Error);
    }
  }
}
