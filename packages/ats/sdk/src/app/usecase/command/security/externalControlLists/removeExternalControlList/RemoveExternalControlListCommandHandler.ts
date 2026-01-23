// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import {
  RemoveExternalControlListCommand,
  RemoveExternalControlListCommandResponse,
} from "./RemoveExternalControlListCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import { RemoveExternalControlListCommandError } from "./error/RemoveExternalControlListCommandError";

@CommandHandler(RemoveExternalControlListCommand)
export class RemoveExternalControlListCommandHandler implements ICommandHandler<RemoveExternalControlListCommand> {
  constructor(
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    public readonly contractService: ContractService,
    @lazyInject(ValidationService)
    public readonly validationService: ValidationService,
  ) {}

  async execute(command: RemoveExternalControlListCommand): Promise<RemoveExternalControlListCommandResponse> {
    try {
      const { securityId, externalControlListAddress } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(
        SecurityRole._CONTROL_LIST_MANAGER_ROLE,
        account.id.toString(),
        securityId,
      );

      const externalControlListEvmAddresses =
        await this.contractService.getContractEvmAddress(externalControlListAddress);

      const res = await handler.removeExternalControlList(
        securityEvmAddress,
        externalControlListEvmAddresses,
        securityId,
      );

      return Promise.resolve(new RemoveExternalControlListCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RemoveExternalControlListCommandError(error as Error);
    }
  }
}
