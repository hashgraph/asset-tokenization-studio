// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { ControllerRedeemCommand, ControllerRedeemCommandResponse } from "./ControllerRedeemCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import { _PARTITION_ID_1 } from "@core/Constants";
import ContractService from "@service/contract/ContractService";
import { ControllerRedeemCommandError } from "./error/ControllerRedeemCommandError";

@CommandHandler(ControllerRedeemCommand)
export class ControllerRedeemCommandHandler implements ICommandHandler<ControllerRedeemCommand> {
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

  async execute(command: ControllerRedeemCommand): Promise<ControllerRedeemCommandResponse> {
    try {
      const { securityId, amount, sourceId } = command;
      const handler = this.transactionService.getHandler();
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkCanRedeem(securityId, sourceId, amount, _PARTITION_ID_1);

      await this.validationService.checkDecimals(security, amount);

      const res = await handler.controllerRedeem(securityEvmAddress, sourceEvmAddress, amountBd, securityId);
      return Promise.resolve(new ControllerRedeemCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ControllerRedeemCommandError(error as Error);
    }
  }
}
