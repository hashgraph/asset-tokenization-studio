// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { GrantKycMockCommand, GrantKycMockCommandResponse } from "./GrantKycMockCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { GrantKycMockCommandError } from "./error/GrantKycMockCommandError";

@CommandHandler(GrantKycMockCommand)
export class GrantKycMockCommandHandler implements ICommandHandler<GrantKycMockCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(command: GrantKycMockCommand): Promise<GrantKycMockCommandResponse> {
    try {
      const { contractId, targetId } = command;
      const handler = this.transactionService.getHandler();

      const contractEvmAddress = await this.contractService.getContractEvmAddress(contractId);

      const targetEvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await handler.grantKycMock(contractEvmAddress, targetEvmAddress, contractId);

      return Promise.resolve(new GrantKycMockCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new GrantKycMockCommandError(error as Error);
    }
  }
}
