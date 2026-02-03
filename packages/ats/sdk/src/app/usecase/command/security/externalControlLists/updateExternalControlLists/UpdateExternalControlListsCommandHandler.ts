// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import {
  UpdateExternalControlListsCommand,
  UpdateExternalControlListsCommandResponse,
} from "./UpdateExternalControlListsCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import { UpdateExternalControlListsCommandError } from "./error/UpdateExternalControlListsCommandError";

@CommandHandler(UpdateExternalControlListsCommand)
export class UpdateExternalControlListsCommandHandler implements ICommandHandler<UpdateExternalControlListsCommand> {
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

  async execute(command: UpdateExternalControlListsCommand): Promise<UpdateExternalControlListsCommandResponse> {
    try {
      const { securityId, externalControlListsAddresses, actives } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(
        SecurityRole._CONTROL_LIST_MANAGER_ROLE,
        account.id.toString(),
        securityId,
      );

      const externalControlListsEvmAddresses = await Promise.all(
        externalControlListsAddresses.map(async (address) => await this.contractService.getContractEvmAddress(address)),
      );

      const res = await handler.updateExternalControlLists(
        securityEvmAddress,
        externalControlListsEvmAddresses,
        actives,
        securityId,
      );

      return Promise.resolve(new UpdateExternalControlListsCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new UpdateExternalControlListsCommandError(error as Error);
    }
  }
}
