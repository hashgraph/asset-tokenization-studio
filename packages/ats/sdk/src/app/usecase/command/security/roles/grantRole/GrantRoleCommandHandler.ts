// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { GrantRoleCommand, GrantRoleCommandResponse } from "./GrantRoleCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { GrantRoleCommandError } from "./error/GrantRoleCommandError";

@CommandHandler(GrantRoleCommand)
export class GrantRoleCommandHandler implements ICommandHandler<GrantRoleCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: GrantRoleCommand): Promise<GrantRoleCommandResponse> {
    try {
      const { role, targetId, securityId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkPause(securityId);

      const res = await handler.grantRole(securityEvmAddress, targetEvmAddress, role, securityId);

      return Promise.resolve(new GrantRoleCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new GrantRoleCommandError(error as Error);
    }
  }
}
