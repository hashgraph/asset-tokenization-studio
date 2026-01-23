// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import { ReleaseCommand, ReleaseCommandResponse } from "./ReleaseCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import ContractService from "@service/contract/ContractService";
import { ReleaseCommandError } from "./error/ReleaseCommandError";

@CommandHandler(ReleaseCommand)
export class ReleaseCommandHandler implements ICommandHandler<ReleaseCommand> {
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

  async execute(command: ReleaseCommand): Promise<ReleaseCommandResponse> {
    try {
      const { securityId, lockId, sourceId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      await this.validationService.checkPause(securityId);

      const lockIdBd: BigDecimal = BigDecimal.fromString(lockId.toString());

      const res = await handler.release(securityEvmAddress, sourceEvmAddress, lockIdBd, command.securityId);
      return Promise.resolve(new ReleaseCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new ReleaseCommandError(error as Error);
    }
  }
}
