// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import SecurityService from "@service/security/SecurityService";
import { SetMaxSupplyCommand, SetMaxSupplyCommandResponse } from "./SetMaxSupplyCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import { SetMaxSupplyCommandError } from "./error/SetMaxSupplyCommandError";

@CommandHandler(SetMaxSupplyCommand)
export class SetMaxSupplyCommandHandler implements ICommandHandler<SetMaxSupplyCommand> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: SetMaxSupplyCommand): Promise<SetMaxSupplyCommandResponse> {
    try {
      const { securityId, maxSupply } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const security = await this.securityService.get(securityId);

      const maxSupplyBd: BigDecimal = BigDecimal.fromString(maxSupply, security.decimals);

      await this.validationService.checkRole(SecurityRole._CAP_ROLE, account.id.toString(), securityId);

      await this.validationService.checkDecimals(security, maxSupply);

      const res = await handler.setMaxSupply(securityEvmAddress, maxSupplyBd);
      return Promise.resolve(new SetMaxSupplyCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new SetMaxSupplyCommandError(error as Error);
    }
  }
}
