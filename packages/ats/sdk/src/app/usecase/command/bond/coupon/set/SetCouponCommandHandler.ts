// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { SetCouponCommand, SetCouponCommandResponse } from "./SetCouponCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import ContractService from "@service/contract/ContractService";
import { SetCouponCommandError } from "./error/SetCouponCommandError";

@CommandHandler(SetCouponCommand)
export class SetCouponCommandHandler implements ICommandHandler<SetCouponCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: SetCouponCommand): Promise<SetCouponCommandResponse> {
    try {
      const { address, recordDate, executionDate, rate, startDate, endDate, fixingDate, rateStatus } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress = await this.contractService.getContractEvmAddress(address);

      const res = await handler.setCoupon(
        securityEvmAddress,
        BigDecimal.fromString(recordDate),
        BigDecimal.fromString(executionDate),
        BigDecimal.fromString(rate),
        BigDecimal.fromString(startDate),
        BigDecimal.fromString(endDate),
        BigDecimal.fromString(fixingDate),
        rateStatus,
        address,
      );

      const couponId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.couponID,
        className: SetCouponCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });

      return Promise.resolve(new SetCouponCommandResponse(parseInt(couponId, 16), res.id!));
    } catch (error) {
      throw new SetCouponCommandError(error as Error);
    }
  }
}
