// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import {
  UnpauseCommand,
  UnpauseCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/unpause/UnpauseCommand";
import { UnpauseCommandError } from "./error/UnpauseCommandError";

@CommandHandler(UnpauseCommand)
export class UnpauseCommandHandler implements ICommandHandler<UnpauseCommand> {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
  ) {}

  async execute(command: UnpauseCommand): Promise<UnpauseCommandResponse> {
    try {
      const { lifeCycleCashFlowId } = command;
      const handler = this.transactionService.getHandler();
      // const account = this.accountService.getCurrentAccount();
      // checks if account has _PAUSER_ROLE

      const lifeCycleCashFlowEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);

      const res = await handler.unpause(lifeCycleCashFlowEvmAddress, lifeCycleCashFlowId);

      return Promise.resolve(new UnpauseCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new UnpauseCommandError(error as Error);
    }
  }
}
