// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { AddToWhiteListMockCommand, AddToWhiteListMockCommandResponse } from "./AddToWhiteListMockCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { AddToWhiteListMockCommandError } from "./error/AddToWhiteListMockCommandError";

@CommandHandler(AddToWhiteListMockCommand)
export class AddToWhiteListMockCommandHandler implements ICommandHandler<AddToWhiteListMockCommand> {
  constructor(
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    public readonly contractService: ContractService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
  ) {}

  async execute(command: AddToWhiteListMockCommand): Promise<AddToWhiteListMockCommandResponse> {
    try {
      const { contractId, targetId } = command;
      const handler = this.transactionService.getHandler();

      const contractEvmAddress = await this.contractService.getContractEvmAddress(contractId);

      const targetEvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await handler.addToWhiteListMock(contractEvmAddress, targetEvmAddress, contractId);

      return Promise.resolve(new AddToWhiteListMockCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new AddToWhiteListMockCommandError(error as Error);
    }
  }
}
