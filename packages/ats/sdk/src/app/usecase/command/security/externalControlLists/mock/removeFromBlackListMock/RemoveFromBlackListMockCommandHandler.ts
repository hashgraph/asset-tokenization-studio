// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import {
  RemoveFromBlackListMockCommand,
  RemoveFromBlackListMockCommandResponse,
} from "./RemoveFromBlackListMockCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { RemoveFromBlackListMockCommandError } from "./error/RemoveFromBlackListMockCommandError";

@CommandHandler(RemoveFromBlackListMockCommand)
export class RemoveFromBlackListMockCommandHandler implements ICommandHandler<RemoveFromBlackListMockCommand> {
  constructor(
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    public readonly contractService: ContractService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
  ) {}

  async execute(command: RemoveFromBlackListMockCommand): Promise<RemoveFromBlackListMockCommandResponse> {
    try {
      const { contractId, targetId } = command;
      const handler = this.transactionService.getHandler();

      const contractEvmAddress = await this.contractService.getContractEvmAddress(contractId);

      const targetEvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await handler.removeFromBlackListMock(contractEvmAddress, targetEvmAddress, contractId);

      return Promise.resolve(new RemoveFromBlackListMockCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RemoveFromBlackListMockCommandError(error as Error);
    }
  }
}
