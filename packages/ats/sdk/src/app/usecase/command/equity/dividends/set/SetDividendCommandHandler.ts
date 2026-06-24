// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { SetDividendCommand, SetDividendCommandResponse } from "./SetDividendCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import ContractService from "@service/contract/ContractService";
import { SetDividendCommandError } from "./error/SetDividendCommandError";

@CommandHandler(SetDividendCommand)
export class SetDividendCommandHandler implements ICommandHandler<SetDividendCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: SetDividendCommand): Promise<SetDividendCommandResponse> {
    try {
      const { address, recordDate, executionDate, amount } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(address);
      const res = await handler.setDividend(
        securityEvmAddress,
        BigDecimal.fromString(recordDate),
        BigDecimal.fromString(executionDate),
        BigDecimal.fromString(amount),
        address,
      );

      const dividendId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.dividendID,
        className: SetDividendCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });

      return Promise.resolve(new SetDividendCommandResponse(parseInt(dividendId, 16), res.id!));
    } catch (error) {
      throw new SetDividendCommandError(error as Error);
    }
  }
}
