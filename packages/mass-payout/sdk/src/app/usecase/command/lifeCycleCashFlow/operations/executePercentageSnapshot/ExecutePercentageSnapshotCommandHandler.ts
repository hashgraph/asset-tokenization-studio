// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import BigDecimal from "@domain/shared/BigDecimal";
import {
  ExecutePercentageSnapshotCommand,
  ExecutePercentageSnapshotCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshot/ExecutePercentageSnapshotCommand";
import { ExecutePercentageSnapshotCommandError } from "./error/ExecutePercentageSnapshotCommandError";

@CommandHandler(ExecutePercentageSnapshotCommand)
export class ExecutePercentageSnapshotCommandHandler implements ICommandHandler<ExecutePercentageSnapshotCommand> {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
  ) {}

  async execute(command: ExecutePercentageSnapshotCommand): Promise<ExecutePercentageSnapshotCommandResponse> {
    try {
      const { lifeCycleCashFlowId, asset, snapshotId, pageIndex, pageLength, percentage, paymentTokenDecimals } =
        command;
      const handler = this.transactionService.getHandler();

      const lifeCycleCashFlowEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);
      const assetAddress = await this.contractService.getContractEvmAddress(asset);
      const percentageBd: BigDecimal = BigDecimal.fromString(percentage, 2);
      const res = await handler.executePercentageSnapshot(
        lifeCycleCashFlowEvmAddress,
        lifeCycleCashFlowId,
        assetAddress,
        snapshotId,
        pageIndex,
        pageLength,
        percentageBd,
      );

      return Promise.resolve(
        new ExecutePercentageSnapshotCommandResponse(
          res.response[0],
          res.response[1],
          res.response[2].map((item) => BigDecimal.fromValue(item, paymentTokenDecimals).toString()),
          res.response[3],
          res.id!,
        ),
      );
    } catch (error) {
      throw new ExecutePercentageSnapshotCommandError(error as Error);
    }
  }
}
