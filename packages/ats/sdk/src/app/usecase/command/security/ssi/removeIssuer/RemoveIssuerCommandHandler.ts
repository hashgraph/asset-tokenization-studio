// SPDX-License-Identifier: Apache-2.0

import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { RemoveIssuerCommand, RemoveIssuerCommandResponse } from "./RemoveIssuerCommand";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { RemoveIssuerCommandError } from "./error/RemoveIssuerCommandError";

@CommandHandler(RemoveIssuerCommand)
export class RemoveIssuerCommandHandler implements ICommandHandler<RemoveIssuerCommand> {
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

  async execute(command: RemoveIssuerCommand): Promise<RemoveIssuerCommandResponse> {
    try {
      const { securityId, issuerId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._SSI_MANAGER_ROLE, account.id.toString(), securityId);

      await this.validationService.checkAccountInIssuersList(securityId, issuerId, false);

      const issuerEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(issuerId);

      const res = await handler.removeIssuer(securityEvmAddress, issuerEvmAddress, securityId);

      return Promise.resolve(new RemoveIssuerCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RemoveIssuerCommandError(error as Error);
    }
  }
}
