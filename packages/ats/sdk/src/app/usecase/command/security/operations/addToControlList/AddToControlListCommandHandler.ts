// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { AddToControlListCommand, AddToControlListCommandResponse } from "./AddToControlListCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { AddToControlListCommandError } from "./error/AddToControlListCommandError";

@CommandHandler(AddToControlListCommand)
export class AddToControlListCommandHandler implements ICommandHandler<AddToControlListCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: AddToControlListCommand): Promise<AddToControlListCommandResponse> {
    try {
      const { targetId, securityId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkAccountInControlList(securityId, targetId, true);

      const res = await handler.addToControlList(securityEvmAddress, targetEvmAddress, securityId);

      return Promise.resolve(new AddToControlListCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new AddToControlListCommandError(error as Error);
    }
  }
}
