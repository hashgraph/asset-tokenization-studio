// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import { UpdateExternalKycListsCommand, UpdateExternalKycListsCommandResponse } from "./UpdateExternalKycListsCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import { UpdateExternalKycListsCommandError } from "./error/UpdateExternalKycListsCommandError";

@CommandHandler(UpdateExternalKycListsCommand)
export class UpdateExternalKycListsCommandHandler implements ICommandHandler<UpdateExternalKycListsCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: UpdateExternalKycListsCommand): Promise<UpdateExternalKycListsCommandResponse> {
    try {
      const { securityId, externalKycListsAddresses, actives } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._KYC_MANAGER_ROLE, account.id.toString(), securityId);

      const externalKycListsEvmAddresses = await Promise.all(
        externalKycListsAddresses.map(async (address) => await this.contractService.getContractEvmAddress(address)),
      );

      const res = await handler.updateExternalKycLists(
        securityEvmAddress,
        externalKycListsEvmAddresses,
        actives,
        securityId,
      );

      return Promise.resolve(new UpdateExternalKycListsCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new UpdateExternalKycListsCommandError(error as Error);
    }
  }
}
