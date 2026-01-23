// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import BigDecimal from "@domain/shared/BigDecimal";
import {
  ExecuteDistributionByAddressesCommand,
  ExecuteDistributionByAddressesCommandResponse,
  // eslint-disable-next-line max-len
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistributionByAddresses/ExecuteDistributionByAddressesCommand";
import { ExecuteDistributionByAddressesCommandError } from "./error/ExecuteDistributionByAddressesCommandError";

@CommandHandler(ExecuteDistributionByAddressesCommand)
export class ExecuteDistributionByAddressesCommandHandler
  implements ICommandHandler<ExecuteDistributionByAddressesCommand>
{
  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
  ) {}

  async execute(
    command: ExecuteDistributionByAddressesCommand,
  ): Promise<ExecuteDistributionByAddressesCommandResponse> {
    try {
      const { lifeCycleCashFlowId, asset, holders, distributionId, paymentTokenDecimals } = command;
      const handler = this.transactionService.getHandler();

      const lifeCycleCashFlowEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);
      const assetAddress = await this.contractService.getContractEvmAddress(asset);

      const holdersAddresses: EvmAddress[] = holders.map((holder) => new EvmAddress(holder));
      const res = await handler.executeDistributionByAddresses(
        lifeCycleCashFlowEvmAddress,
        lifeCycleCashFlowId,
        assetAddress,
        distributionId,
        holdersAddresses,
      );

      return Promise.resolve(
        new ExecuteDistributionByAddressesCommandResponse(
          res.response[0],
          res.response[1],
          res.response[2].map((item) => BigDecimal.fromValue(item, paymentTokenDecimals).toString()),
          res.id!,
        ),
      );
    } catch (error) {
      throw new ExecuteDistributionByAddressesCommandError(error as Error);
    }
  }
}
