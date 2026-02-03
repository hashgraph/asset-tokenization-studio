// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { BurnCommand, BurnCommandResponse } from "./BurnCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import { _PARTITION_ID_1 } from "@core/Constants";
import ContractService from "@service/contract/ContractService";
import { BurnCommandError } from "./error/BurnCommandError";
import { SecurityRole } from "@domain/context/security/SecurityRole";

@CommandHandler(BurnCommand)
export class BurnCommandHandler implements ICommandHandler<BurnCommand> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: BurnCommand): Promise<BurnCommandResponse> {
    try {
      const { sourceId, securityId, amount } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      await this.validationService.checkClearingDeactivated(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkCanRedeem(securityId, sourceId, amount, _PARTITION_ID_1);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const security = await this.securityService.get(securityId);
      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkAnyRole(
        [SecurityRole._CONTROLLER_ROLE, SecurityRole._AGENT_ROLE],
        account.id.toString(),
        securityId,
      );

      const amountBd: BigDecimal = BigDecimal.fromString(amount, security.decimals);

      const res = await handler.burn(sourceEvmAddress, securityEvmAddress, amountBd, securityId);

      return Promise.resolve(new BurnCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new BurnCommandError(error as Error);
    }
  }
}
