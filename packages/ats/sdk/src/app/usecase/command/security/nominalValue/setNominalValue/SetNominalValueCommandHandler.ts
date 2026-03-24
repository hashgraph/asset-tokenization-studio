// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { SetNominalValueCommand, SetNominalValueCommandResponse } from "./SetNominalValueCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { SetNominalValueCommandError } from "./error/SetNominalValueCommandError";

@CommandHandler(SetNominalValueCommand)
export class SetNominalValueCommandHandler implements ICommandHandler<SetNominalValueCommand> {
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

  async execute(command: SetNominalValueCommand): Promise<SetNominalValueCommandResponse> {
    try {
      const { securityId, nominalValue, nominalValueDecimals } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._NOMINAL_VALUE_ROLE, account.id.toString(), securityId);

      const res = await handler.setNominalValue(securityEvmAddress, nominalValue, nominalValueDecimals, securityId);

      return Promise.resolve(new SetNominalValueCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new SetNominalValueCommandError(error as Error);
    }
  }
}
