// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { RevokeRoleCommand, RevokeRoleCommandResponse } from "./RevokeRoleCommand";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { RevokeRoleCommandError } from "./error/RevokeRoleCommandError";

@CommandHandler(RevokeRoleCommand)
export class RevokeRoleCommandHandler implements ICommandHandler<RevokeRoleCommand> {
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

  async execute(command: RevokeRoleCommand): Promise<RevokeRoleCommandResponse> {
    try {
      const { role, targetId, securityId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkPause(securityId);

      const res = await handler.revokeRole(securityEvmAddress, targetEvmAddress, role, securityId);

      // return Promise.resolve({ payload: res.response ?? false });
      return Promise.resolve(new RevokeRoleCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RevokeRoleCommandError(error as Error);
    }
  }
}
