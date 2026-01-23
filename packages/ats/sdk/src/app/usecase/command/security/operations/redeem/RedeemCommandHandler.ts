// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { RedeemCommand, RedeemCommandResponse } from "./RedeemCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import { _PARTITION_ID_1 } from "@core/Constants";
import ContractService from "@service/contract/ContractService";
import { RedeemCommandError } from "./error/RedeemCommandError";

@CommandHandler(RedeemCommand)
export class RedeemCommandHandler implements ICommandHandler<RedeemCommand> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,

    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: RedeemCommand): Promise<RedeemCommandResponse> {
    try {
      const { securityId, amount } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkCanRedeem(securityId, account.id.toString(), amount, _PARTITION_ID_1);

      const security = await this.securityService.get(securityId);
      await this.validationService.checkDecimals(security, amount);

      const amountBd: BigDecimal = BigDecimal.fromString(amount, security.decimals);

      const res = await handler.redeem(securityEvmAddress, amountBd, securityId);
      return Promise.resolve(new RedeemCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new RedeemCommandError(error as Error);
    }
  }
}
