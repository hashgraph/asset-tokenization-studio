// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { AddExternalKycListCommand, AddExternalKycListCommandResponse } from "./AddExternalKycListCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import { AddExternalKycListCommandError } from "./error/AddExternalKycListCommandError";

@CommandHandler(AddExternalKycListCommand)
export class AddExternalKycListCommandHandler implements ICommandHandler<AddExternalKycListCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: AddExternalKycListCommand): Promise<AddExternalKycListCommandResponse> {
    try {
      const { securityId, externalKycListAddress } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._KYC_MANAGER_ROLE, account.id.toString(), securityId);

      const externalKycListEvmAddresses = await this.contractService.getContractEvmAddress(externalKycListAddress);

      const res = await handler.addExternalKycList(securityEvmAddress, externalKycListEvmAddresses, securityId);

      return Promise.resolve(new AddExternalKycListCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new AddExternalKycListCommandError(error as Error);
    }
  }
}
