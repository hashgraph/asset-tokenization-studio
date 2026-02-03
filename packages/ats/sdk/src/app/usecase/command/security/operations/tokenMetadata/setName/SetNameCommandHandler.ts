// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { SetNameCommand, SetNameCommandResponse } from "./SetNameCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { SetNameCommandError } from "./error/SetNameCommandError";

@CommandHandler(SetNameCommand)
export class SetNameCommandHandler implements ICommandHandler<SetNameCommand> {
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

  async execute(command: SetNameCommand): Promise<SetNameCommandResponse> {
    try {
      const { securityId, name } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._TREX_OWNER_ROLE, account.id.toString(), securityId);

      const res = await handler.setName(securityEvmAddress, name, securityId);

      return Promise.resolve(new SetNameCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new SetNameCommandError(error as Error);
    }
  }
}
