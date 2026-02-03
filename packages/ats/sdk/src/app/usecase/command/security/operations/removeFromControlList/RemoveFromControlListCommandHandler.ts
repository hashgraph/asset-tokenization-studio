// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { RemoveFromControlListCommand, RemoveFromControlListCommandResponse } from "./RemoveFromControlListCommand";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { RemoveFromControlListCommandError } from "./error/RemoveFromControlListCommandError";

@CommandHandler(RemoveFromControlListCommand)
export class RemoveFromControlListCommandHandler implements ICommandHandler<RemoveFromControlListCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: RemoveFromControlListCommand): Promise<RemoveFromControlListCommandResponse> {
    try {
      const { targetId, securityId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkAccountInControlList(securityId, targetId, false);

      const res = await handler.removeFromControlList(securityEvmAddress, targetEvmAddress, securityId);
      // return Promise.resolve({ payload: res.response });
      return Promise.resolve(new RemoveFromControlListCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RemoveFromControlListCommandError(error as Error);
    }
  }
}
