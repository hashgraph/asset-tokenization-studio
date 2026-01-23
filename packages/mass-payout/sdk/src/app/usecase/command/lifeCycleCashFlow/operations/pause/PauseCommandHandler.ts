// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import {
  PauseCommand,
  PauseCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/pause/PauseCommand";
import { PauseCommandError } from "./error/PauseCommandError";

@CommandHandler(PauseCommand)
export class PauseCommandHandler implements ICommandHandler<PauseCommand> {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
  ) {}

  async execute(command: PauseCommand): Promise<PauseCommandResponse> {
    try {
      const { lifeCycleCashFlowId } = command;
      const handler = this.transactionService.getHandler();
      // const account = this.accountService.getCurrentAccount();
      // checks if account has _PAUSER_ROLE

      const lifeCycleCashFlowEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);

      const res = await handler.pause(lifeCycleCashFlowEvmAddress, lifeCycleCashFlowId);

      return Promise.resolve(new PauseCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new PauseCommandError(error as Error);
    }
  }
}
