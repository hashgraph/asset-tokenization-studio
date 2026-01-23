// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { SetPausedMockCommand, SetPausedMockCommandResponse } from "./SetPausedMockCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import { SetPausedMockCommandError } from "./error/SetPausedMockCommandError";

@CommandHandler(SetPausedMockCommand)
export class SetPausedMockCommandHandler implements ICommandHandler<SetPausedMockCommand> {
  constructor(
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    public readonly contractService: ContractService,
  ) {}

  async execute(command: SetPausedMockCommand): Promise<SetPausedMockCommandResponse> {
    try {
      const { contractId, paused } = command;
      const handler = this.transactionService.getHandler();

      const contractEvmAddress = await this.contractService.getContractEvmAddress(contractId);

      const res = await handler.setPausedMock(contractEvmAddress, paused, contractId);

      return Promise.resolve(new SetPausedMockCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new SetPausedMockCommandError(error as Error);
    }
  }
}
