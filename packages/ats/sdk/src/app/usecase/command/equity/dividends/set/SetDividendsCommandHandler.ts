// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { SetDividendsCommand, SetDividendsCommandResponse } from "./SetDividendsCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import ContractService from "@service/contract/ContractService";
import { SetDividendsCommandError } from "./error/SetDividendsCommandError";

@CommandHandler(SetDividendsCommand)
export class SetDividendsCommandHandler implements ICommandHandler<SetDividendsCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: SetDividendsCommand): Promise<SetDividendsCommandResponse> {
    try {
      const { address, recordDate, executionDate, amount } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(address);
      const res = await handler.setDividends(
        securityEvmAddress,
        BigDecimal.fromString(recordDate),
        BigDecimal.fromString(executionDate),
        BigDecimal.fromString(amount),
        address,
      );

      const dividendId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.dividendID,
        className: SetDividendsCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });

      return Promise.resolve(new SetDividendsCommandResponse(parseInt(dividendId, 16), res.id!));
    } catch (error) {
      throw new SetDividendsCommandError(error as Error);
    }
  }
}
