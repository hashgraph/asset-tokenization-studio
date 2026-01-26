// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import BigDecimal from "@domain/shared/BigDecimal";
import {
  ExecuteBondCashOutCommand,
  ExecuteBondCashOutCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOut/ExecuteBondCashOutCommand";
import { ExecuteBondCashOutCommandError } from "./error/ExecuteBondCashOutCommandError";

@CommandHandler(ExecuteBondCashOutCommand)
export class ExecuteBondCashOutCommandHandler implements ICommandHandler<ExecuteBondCashOutCommand> {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
  ) {}

  async execute(command: ExecuteBondCashOutCommand): Promise<ExecuteBondCashOutCommandResponse> {
    try {
      const { lifeCycleCashFlowId, bond, pageIndex, pageLength, paymentTokenDecimals } = command;
      const handler = this.transactionService.getHandler();

      const lifeCycleCashFlowEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(lifeCycleCashFlowId);
      const bondAddress = await this.contractService.getContractEvmAddress(bond);

      const res = await handler.executeBondCashOut(
        lifeCycleCashFlowEvmAddress,
        lifeCycleCashFlowId,
        bondAddress,
        pageIndex,
        pageLength,
      );

      return Promise.resolve(
        new ExecuteBondCashOutCommandResponse(
          res.response[0],
          res.response[1],
          res.response[2].map((item) => BigDecimal.fromValue(item, paymentTokenDecimals).toString()),
          res.response[3],
          res.id!,
        ),
      );
    } catch (error) {
      throw new ExecuteBondCashOutCommandError(error as Error);
    }
  }
}
