// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { CancelCouponCommand, CancelCouponCommandResponse } from "./CancelCouponCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { CancelCouponCommandError } from "./error/CancelCouponCommandError";

@CommandHandler(CancelCouponCommand)
export class CancelCouponCommandHandler implements ICommandHandler<CancelCouponCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: CancelCouponCommand): Promise<CancelCouponCommandResponse> {
    try {
      const { securityId, couponId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);
      await this.validationService.checkRole(SecurityRole._CORPORATEACTIONS_ROLE, account.evmAddress!, securityId);

      const res = await handler.cancelCoupon(securityEvmAddress, couponId, securityId);

      return Promise.resolve(new CancelCouponCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new CancelCouponCommandError(error as Error);
    }
  }
}
