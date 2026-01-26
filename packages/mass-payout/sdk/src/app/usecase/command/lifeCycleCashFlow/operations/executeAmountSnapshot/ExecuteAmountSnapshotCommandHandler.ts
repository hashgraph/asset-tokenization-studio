// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import BigDecimal from "@domain/shared/BigDecimal";
import {
  ExecuteAmountSnapshotCommand,
  ExecuteAmountSnapshotCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshot/ExecuteAmountSnapshotCommand";
import { ExecuteAmountSnapshotCommandError } from "./error/ExecuteAmountSnapshotCommandError";

@CommandHandler(ExecuteAmountSnapshotCommand)
export class ExecuteAmountSnapshotCommandHandler implements ICommandHandler<ExecuteAmountSnapshotCommand> {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
  ) {}

  async execute(command: ExecuteAmountSnapshotCommand): Promise<ExecuteAmountSnapshotCommandResponse> {
    try {
      const { lifeCycleCashFlowId, asset, snapshotId, pageIndex, pageLength, amount, paymentTokenDecimals } = command;
      const handler = this.transactionService.getHandler();

      const lifeCycleCashFlowEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);
      const assetAddress = await this.contractService.getContractEvmAddress(asset);

      const amountBd: BigDecimal = BigDecimal.fromString(amount, paymentTokenDecimals);

      const res = await handler.executeAmountSnapshot(
        lifeCycleCashFlowEvmAddress,
        lifeCycleCashFlowId,
        assetAddress,
        snapshotId,
        pageIndex,
        pageLength,
        amountBd,
      );

      return Promise.resolve(
        new ExecuteAmountSnapshotCommandResponse(
          res.response[0],
          res.response[1],
          res.response[2].map((item) => BigDecimal.fromValue(item, paymentTokenDecimals).toString()),
          res.response[3],
          res.id!,
        ),
      );
    } catch (error) {
      throw new ExecuteAmountSnapshotCommandError(error as Error);
    }
  }
}
