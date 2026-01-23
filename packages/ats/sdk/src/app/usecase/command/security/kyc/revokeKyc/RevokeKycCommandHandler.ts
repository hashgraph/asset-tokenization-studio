// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { RevokeKycCommand, RevokeKycCommandResponse } from "./RevokeKycCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { RevokeKycCommandError } from "./error/RevokeKycCommandError";

@CommandHandler(RevokeKycCommand)
export class RevokeKycCommandHandler implements ICommandHandler<RevokeKycCommand> {
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

  async execute(command: RevokeKycCommand): Promise<RevokeKycCommandResponse> {
    try {
      const { securityId, targetId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._KYC_ROLE, account.id.toString(), securityId);

      const res = await handler.revokeKyc(securityEvmAddress, targetEvmAddress, securityId);

      return Promise.resolve(new RevokeKycCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RevokeKycCommandError(error as Error);
    }
  }
}
