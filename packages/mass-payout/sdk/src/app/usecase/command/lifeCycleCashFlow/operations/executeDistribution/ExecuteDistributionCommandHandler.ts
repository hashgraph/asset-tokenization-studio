// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import BigDecimal from "@domain/shared/BigDecimal";
import {
  ExecuteDistributionCommand,
  ExecuteDistributionCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistribution/ExecuteDistributionCommand";
import { ExecuteDistributionCommandError } from "./error/ExecuteDistributionCommandError";

@CommandHandler(ExecuteDistributionCommand)
export class ExecuteDistributionCommandHandler implements ICommandHandler<ExecuteDistributionCommand> {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
  ) {}

  async execute(command: ExecuteDistributionCommand): Promise<ExecuteDistributionCommandResponse> {
    try {
      const { lifeCycleCashFlowId, asset, pageIndex, pageLength, distributionId, paymentTokenDecimals } = command;
      const handler = this.transactionService.getHandler();

      const lifeCycleCashFlowEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);
      const assetAddress = await this.contractService.getContractEvmAddress(asset);

      const res = await handler.executeDistribution(
        lifeCycleCashFlowEvmAddress,
        lifeCycleCashFlowId,
        assetAddress,
        distributionId,
        pageIndex,
        pageLength,
      );

      return Promise.resolve(
        new ExecuteDistributionCommandResponse(
          res.response[0],
          res.response[1],
          res.response[2].map((item) => BigDecimal.fromValue(item, paymentTokenDecimals).toString()),
          res.response[3],
          res.id!,
        ),
      );
    } catch (error) {
      throw new ExecuteDistributionCommandError(error as Error);
    }
  }
}
