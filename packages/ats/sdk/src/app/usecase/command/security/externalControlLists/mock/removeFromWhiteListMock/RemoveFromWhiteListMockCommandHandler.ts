// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import {
  RemoveFromWhiteListMockCommand,
  RemoveFromWhiteListMockCommandResponse,
} from "./RemoveFromWhiteListMockCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { RemoveFromWhiteListMockCommandError } from "./error/RemoveFromWhiteListMockCommandError";

@CommandHandler(RemoveFromWhiteListMockCommand)
export class RemoveFromWhiteListMockCommandHandler implements ICommandHandler<RemoveFromWhiteListMockCommand> {
  constructor(
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    public readonly contractService: ContractService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
  ) {}

  async execute(command: RemoveFromWhiteListMockCommand): Promise<RemoveFromWhiteListMockCommandResponse> {
    try {
      const { contractId, targetId } = command;
      const handler = this.transactionService.getHandler();

      const contractEvmAddress = await this.contractService.getContractEvmAddress(contractId);

      const targetEvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await handler.removeFromWhiteListMock(contractEvmAddress, targetEvmAddress, contractId);

      return Promise.resolve(new RemoveFromWhiteListMockCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RemoveFromWhiteListMockCommandError(error as Error);
    }
  }
}
