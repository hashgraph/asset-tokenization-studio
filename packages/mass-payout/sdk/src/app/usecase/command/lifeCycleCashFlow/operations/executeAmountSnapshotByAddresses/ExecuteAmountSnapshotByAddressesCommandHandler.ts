// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import BigDecimal from "@domain/shared/BigDecimal";
import {
  ExecuteAmountSnapshotByAddressesCommand,
  ExecuteAmountSnapshotByAddressesCommandResponse,
  // eslint-disable-next-line max-len
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshotByAddresses/ExecuteAmountSnapshotByAddressesCommand";
import { ExecuteAmountSnapshotByAddressesCommandError } from "./error/ExecuteAmountSnapshotByAddressesCommandError";

@CommandHandler(ExecuteAmountSnapshotByAddressesCommand)
export class ExecuteAmountSnapshotByAddressesCommandHandler
  implements ICommandHandler<ExecuteAmountSnapshotByAddressesCommand>
{
  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
  ) {}

  async execute(
    command: ExecuteAmountSnapshotByAddressesCommand,
  ): Promise<ExecuteAmountSnapshotByAddressesCommandResponse> {
    try {
      const { lifeCycleCashFlowId, asset, snapshotId, holders, amount, paymentTokenDecimals } = command;
      const handler = this.transactionService.getHandler();

      const lifeCycleCashFlowEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);
      const assetAddress = await this.contractService.getContractEvmAddress(asset);

      const holdersAddresses: EvmAddress[] = holders.map((holder) => new EvmAddress(holder));
      const amountBd: BigDecimal = BigDecimal.fromString(amount, paymentTokenDecimals);

      const res = await handler.executeAmountSnapshotByAddresses(
        lifeCycleCashFlowEvmAddress,
        lifeCycleCashFlowId,
        assetAddress,
        snapshotId,
        holdersAddresses,
        amountBd,
      );

      return Promise.resolve(
        new ExecuteAmountSnapshotByAddressesCommandResponse(
          res.response[0],
          res.response[1],
          res.response[2].map((item) => BigDecimal.fromValue(item, paymentTokenDecimals).toString()),
          res.id!,
        ),
      );
    } catch (error) {
      throw new ExecuteAmountSnapshotByAddressesCommandError(error as Error);
    }
  }
}
