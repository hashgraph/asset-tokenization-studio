// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import BigDecimal from "@domain/shared/BigDecimal";
import {
  ExecutePercentageSnapshotByAddressesCommand,
  ExecutePercentageSnapshotByAddressesCommandResponse,
  // eslint-disable-next-line max-len
} from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshotByAddresses/ExecutePercentageSnapshotByAddressesCommand";
import { ExecutePercentageSnapshotByAddressesCommandError } from "./error/ExecutePercentageSnapshotByAddressesCommandError";

@CommandHandler(ExecutePercentageSnapshotByAddressesCommand)
export class ExecutePercentageSnapshotByAddressesCommandHandler
  implements ICommandHandler<ExecutePercentageSnapshotByAddressesCommand>
{
  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
  ) {}

  async execute(
    command: ExecutePercentageSnapshotByAddressesCommand,
  ): Promise<ExecutePercentageSnapshotByAddressesCommandResponse> {
    try {
      const { lifeCycleCashFlowId, asset, snapshotId, holders, percentage, paymentTokenDecimals } = command;
      const handler = this.transactionService.getHandler();

      const lifeCycleCashFlowEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);
      const assetAddress = await this.contractService.getContractEvmAddress(asset);

      const holdersAddresses: EvmAddress[] = holders.map((holder) => new EvmAddress(holder));
      const percentageBd: BigDecimal = BigDecimal.fromString(percentage, 2);

      const res = await handler.executePercentageSnapshotByAddresses(
        lifeCycleCashFlowEvmAddress,
        lifeCycleCashFlowId,
        assetAddress,
        snapshotId,
        holdersAddresses,
        percentageBd,
      );

      return Promise.resolve(
        new ExecutePercentageSnapshotByAddressesCommandResponse(
          res.response[0],
          res.response[1],
          res.response[2].map((item) => BigDecimal.fromValue(item, paymentTokenDecimals).toString()),
          res.id!,
        ),
      );
    } catch (error) {
      throw new ExecutePercentageSnapshotByAddressesCommandError(error as Error);
    }
  }
}
