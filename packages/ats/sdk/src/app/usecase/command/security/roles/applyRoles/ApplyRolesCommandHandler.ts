// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import TransactionService from "@service/transaction/TransactionService";
import { ApplyRolesCommand, ApplyRolesCommandResponse } from "./ApplyRolesCommand";
import ValidationService from "@service/validation/ValidationService";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { ApplyRolesCommandError } from "./error/ApplyRolesCommandError";

@CommandHandler(ApplyRolesCommand)
export class ApplyRolesCommandHandler implements ICommandHandler<ApplyRolesCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: ApplyRolesCommand): Promise<ApplyRolesCommandResponse> {
    try {
      const { roles, actives, targetId, securityId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkPause(securityId);

      const res = await handler.applyRoles(securityEvmAddress, targetEvmAddress, roles, actives, securityId);

      return Promise.resolve(new ApplyRolesCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ApplyRolesCommandError(error as Error);
    }
  }
}
