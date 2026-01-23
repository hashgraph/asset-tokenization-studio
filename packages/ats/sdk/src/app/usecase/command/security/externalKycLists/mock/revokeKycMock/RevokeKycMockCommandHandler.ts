// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { RevokeKycMockCommand, RevokeKycMockCommandResponse } from "./RevokeKycMockCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { RevokeKycMockCommandError } from "./error/RevokeKycMockCommandError";

@CommandHandler(RevokeKycMockCommand)
export class RevokeKycMockCommandHandler implements ICommandHandler<RevokeKycMockCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(command: RevokeKycMockCommand): Promise<RevokeKycMockCommandResponse> {
    try {
      const { contractId, targetId } = command;
      const handler = this.transactionService.getHandler();

      const contractEvmAddress = await this.contractService.getContractEvmAddress(contractId);

      const targetEvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await handler.revokeKycMock(contractEvmAddress, targetEvmAddress, contractId);

      return Promise.resolve(new RevokeKycMockCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RevokeKycMockCommandError(error as Error);
    }
  }
}
