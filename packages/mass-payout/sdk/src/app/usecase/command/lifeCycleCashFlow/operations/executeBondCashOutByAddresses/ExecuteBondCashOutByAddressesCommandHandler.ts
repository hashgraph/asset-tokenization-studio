// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import BigDecimal from "@domain/shared/BigDecimal";
import {
  ExecuteBondCashOutByAddressesCommand,
  ExecuteBondCashOutByAddressesCommandResponse,
  // eslint-disable-next-line max-len
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOutByAddresses/ExecuteBondCashOutByAddressesCommand";
import { ExecuteBondCashOutByAddressesCommandError } from "./error/ExecuteBondCashOutByAddressesCommandError";

@CommandHandler(ExecuteBondCashOutByAddressesCommand)
export class ExecuteBondCashOutByAddressesCommandHandler
  implements ICommandHandler<ExecuteBondCashOutByAddressesCommand>
{
  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
  ) {}

  async execute(command: ExecuteBondCashOutByAddressesCommand): Promise<ExecuteBondCashOutByAddressesCommandResponse> {
    try {
      const { lifeCycleCashFlowId, bond, holders, paymentTokenDecimals } = command;
      const handler = this.transactionService.getHandler();

      const lifeCycleCashFlowEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);
      const bondAddress = await this.contractService.getContractEvmAddress(bond);

      const holdersAddresses: EvmAddress[] = holders.map((holder) => new EvmAddress(holder));
      const res = await handler.executeBondCashOutByAddresses(
        lifeCycleCashFlowEvmAddress,
        lifeCycleCashFlowId,
        bondAddress,
        holdersAddresses,
      );

      return Promise.resolve(
        new ExecuteBondCashOutByAddressesCommandResponse(
          res.response[0],
          res.response[1],
          res.response[2].map((item) => BigDecimal.fromValue(item, paymentTokenDecimals).toString()),
          res.id!,
        ),
      );
    } catch (error) {
      throw new ExecuteBondCashOutByAddressesCommandError(error as Error);
    }
  }
}
