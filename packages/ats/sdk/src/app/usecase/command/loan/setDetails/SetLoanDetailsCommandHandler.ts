// SPDX-License-Identifier: Apache-2.0

import { SetLoanDetailsCommand, SetLoanDetailsCommandResponse } from "./SetLoanDetailsCommand";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { toLoanDetails } from "@domain/context/loan/LoanDetailsMapper";
import { SetLoanDetailsCommandError } from "./error/SetLoanDetailsCommandError";

@CommandHandler(SetLoanDetailsCommand)
export class SetLoanDetailsCommandHandler implements ICommandHandler<SetLoanDetailsCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
  ) {}

  async execute(command: SetLoanDetailsCommand): Promise<SetLoanDetailsCommandResponse> {
    try {
      const loanEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(command.loanId);

      const loanDetails = toLoanDetails(command);

      const handler = this.transactionService.getHandler();
      const res = await handler.setLoanDetails(loanEvmAddress, loanDetails);

      return Promise.resolve(new SetLoanDetailsCommandResponse(res.id!));
    } catch (error) {
      throw new SetLoanDetailsCommandError(error as Error);
    }
  }
}
