// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { SetImpactDataCommand, SetImpactDataCommandResponse } from "./SetImpactDataCommand";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import { SetImpactDataCommandError } from "./error/SetImpactDataCommandError";
import ValidationService from "@service/validation/ValidationService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import AccountService from "@service/account/AccountService";

@CommandHandler(SetImpactDataCommand)
export class SetImpactDataCommandHandler implements ICommandHandler<SetImpactDataCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(command: SetImpactDataCommand): Promise<SetImpactDataCommandResponse> {
    try {
      // TODO <username> This code should be validated by the user.
      const { securityId, maxDeviationCap, baseLine, maxDeviationFloor, impactDataDecimals, adjustmentPrecision } =
        command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(
        SecurityRole._INTEREST_RATE_MANAGER_ROLE,
        account.id.toString(),
        securityId,
      );

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const maxDeviationCapBd = BigDecimal.fromString(maxDeviationCap, impactDataDecimals);
      const baseLineBd = BigDecimal.fromString(baseLine, impactDataDecimals);
      const maxDeviationFloorBd = BigDecimal.fromString(maxDeviationFloor, impactDataDecimals);
      const adjustmentPrecisionBd = BigDecimal.fromString(adjustmentPrecision, impactDataDecimals);

      const res = await handler.setImpactData(
        securityEvmAddress,
        maxDeviationCapBd,
        baseLineBd,
        maxDeviationFloorBd,
        impactDataDecimals,
        adjustmentPrecisionBd,
        securityId,
      );

      return Promise.resolve(new SetImpactDataCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new SetImpactDataCommandError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
