// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { ReclaimHoldByPartitionCommand, ReclaimHoldByPartitionCommandResponse } from "./ReclaimHoldByPartitionCommand";
import ValidationService from "@service/validation/ValidationService";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { ReclaimHoldByPartitionCommandError } from "./error/ReclaimHoldByPartitionCommandError";

@CommandHandler(ReclaimHoldByPartitionCommand)
export class ReclaimHoldByPartitionCommandHandler implements ICommandHandler<ReclaimHoldByPartitionCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: ReclaimHoldByPartitionCommand): Promise<ReclaimHoldByPartitionCommandResponse> {
    try {
      const { securityId, partitionId, holdId, targetId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkPause(securityId);

      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await handler.reclaimHoldByPartition(
        securityEvmAddress,
        partitionId,
        holdId,
        targetEvmAddress,
        securityId,
      );

      return Promise.resolve(new ReclaimHoldByPartitionCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ReclaimHoldByPartitionCommandError(error as Error);
    }
  }
}
