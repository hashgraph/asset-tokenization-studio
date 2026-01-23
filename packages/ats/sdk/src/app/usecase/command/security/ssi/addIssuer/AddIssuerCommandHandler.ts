// SPDX-License-Identifier: Apache-2.0

import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { AddIssuerCommand, AddIssuerCommandResponse } from "./AddIssuerCommand";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { AddIssuerCommandError } from "./error/AddIssuerCommandError";

@CommandHandler(AddIssuerCommand)
export class AddIssuerCommandHandler implements ICommandHandler<AddIssuerCommand> {
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

  async execute(command: AddIssuerCommand): Promise<AddIssuerCommandResponse> {
    try {
      const { securityId, issuerId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._SSI_MANAGER_ROLE, account.id.toString(), securityId);

      const issuerEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(issuerId);

      await this.validationService.checkAccountInIssuersList(securityId, issuerId, true);

      const res = await handler.addIssuer(securityEvmAddress, issuerEvmAddress, securityId);

      return Promise.resolve(new AddIssuerCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new AddIssuerCommandError(error as Error);
    }
  }
}
