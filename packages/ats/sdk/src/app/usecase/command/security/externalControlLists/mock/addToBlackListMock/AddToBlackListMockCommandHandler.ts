// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { AddToBlackListMockCommand, AddToBlackListMockCommandResponse } from "./AddToBlackListMockCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { AddToBlackListMockCommandError } from "./error/AddToBlackListMockCommandError";

@CommandHandler(AddToBlackListMockCommand)
export class AddToBlackListMockCommandHandler implements ICommandHandler<AddToBlackListMockCommand> {
  constructor(
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    public readonly contractService: ContractService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
  ) {}

  async execute(command: AddToBlackListMockCommand): Promise<AddToBlackListMockCommandResponse> {
    try {
      const { contractId, targetId } = command;
      const handler = this.transactionService.getHandler();

      const contractEvmAddress = await this.contractService.getContractEvmAddress(contractId);

      const targetEvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await handler.addToBlackListMock(contractEvmAddress, targetEvmAddress, contractId);

      return Promise.resolve(new AddToBlackListMockCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new AddToBlackListMockCommandError(error as Error);
    }
  }
}
