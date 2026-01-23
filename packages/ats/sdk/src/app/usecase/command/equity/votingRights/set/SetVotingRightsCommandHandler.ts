// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { SetVotingRightsCommand, SetVotingRightsCommandResponse } from "./SetVotingRightsCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import ContractService from "@service/contract/ContractService";
import { SetVotingRightsCommandError } from "./error/SetVotingRightsCommandError";

@CommandHandler(SetVotingRightsCommand)
export class SetVotingRightsCommandHandler implements ICommandHandler<SetVotingRightsCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: SetVotingRightsCommand): Promise<SetVotingRightsCommandResponse> {
    try {
      const { address, recordDate, data } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(address);
      const res = await handler.setVotingRights(
        securityEvmAddress,
        BigDecimal.fromString(recordDate.substring(0, 10)),
        data,
        address,
      );

      const voteId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.voteId,
        className: SetVotingRightsCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });

      return Promise.resolve(new SetVotingRightsCommandResponse(parseInt(voteId, 16), res.id!));
    } catch (error) {
      throw new SetVotingRightsCommandError(error as Error);
    }
  }
}
