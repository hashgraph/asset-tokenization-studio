// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { DeactivateInternalKycCommand, DeactivateInternalKycCommandResponse } from "./DeactivateInternalKycCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import { DeactivateInternalKycCommandError } from "./error/DeactivateInternalKycCommandError";

@CommandHandler(DeactivateInternalKycCommand)
export class DeactivateInternalKycCommandHandler implements ICommandHandler<DeactivateInternalKycCommand> {
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

  async execute(command: DeactivateInternalKycCommand): Promise<DeactivateInternalKycCommandResponse> {
    try {
      const { securityId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(
        SecurityRole._INTERNAL_KYC_MANAGER_ROLE,
        account.id.toString(),
        securityId,
      );

      const res = await handler.deactivateInternalKyc(securityEvmAddress, securityId);

      return Promise.resolve(new DeactivateInternalKycCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new DeactivateInternalKycCommandError(error as Error);
    }
  }
}
