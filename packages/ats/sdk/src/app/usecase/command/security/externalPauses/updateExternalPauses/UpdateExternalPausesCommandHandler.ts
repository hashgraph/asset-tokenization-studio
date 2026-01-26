// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { UpdateExternalPausesCommand, UpdateExternalPausesCommandResponse } from "./UpdateExternalPausesCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { UpdateExternalPausesCommandError } from "./error/UpdateExternalPausesCommandError";

@CommandHandler(UpdateExternalPausesCommand)
export class UpdateExternalPausesCommandHandler implements ICommandHandler<UpdateExternalPausesCommand> {
  constructor(
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(ContractService)
    public readonly contractService: ContractService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    public readonly validationService: ValidationService,
  ) {}

  async execute(command: UpdateExternalPausesCommand): Promise<UpdateExternalPausesCommandResponse> {
    try {
      const { securityId, externalPausesAddresses, actives } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._PAUSE_MANAGER_ROLE, account.id.toString(), securityId);

      const externalPausesEvmAddresses = await Promise.all(
        externalPausesAddresses.map(async (address) => await this.contractService.getContractEvmAddress(address)),
      );

      const res = await handler.updateExternalPauses(
        securityEvmAddress,
        externalPausesEvmAddresses,
        actives,
        securityId,
      );

      return Promise.resolve(new UpdateExternalPausesCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new UpdateExternalPausesCommandError(error as Error);
    }
  }
}
