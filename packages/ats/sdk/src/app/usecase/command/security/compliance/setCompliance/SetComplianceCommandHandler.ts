// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { SetComplianceCommand, SetComplianceCommandResponse } from "./SetComplianceCommand";
import { SetComplianceCommandError } from "./error/SetComplianceCommandError";

@CommandHandler(SetComplianceCommand)
export class SetComplianceCommandHandler implements ICommandHandler<SetComplianceCommand> {
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

  async execute(command: SetComplianceCommand): Promise<SetComplianceCommandResponse> {
    try {
      const { securityId, compliance } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const complianceEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(compliance);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._TREX_OWNER_ROLE, account.id.toString(), securityId);

      const res = await handler.setCompliance(securityEvmAddress, complianceEvmAddress, securityId);

      return Promise.resolve(new SetComplianceCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new SetComplianceCommandError(error as Error);
    }
  }
}
