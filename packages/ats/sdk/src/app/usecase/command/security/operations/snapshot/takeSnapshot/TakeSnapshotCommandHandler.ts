// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import { TakeSnapshotCommand, TakeSnapshotCommandResponse } from "./TakeSnapshotCommand";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import TransactionService from "@service/transaction/TransactionService";
import ValidationService from "@service/validation/ValidationService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { TakeSnapshotCommandError } from "./error/TakeSnapshotCommandError";

@CommandHandler(TakeSnapshotCommand)
export class TakeSnapshotCommandHandler implements ICommandHandler<TakeSnapshotCommand> {
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: TakeSnapshotCommand): Promise<TakeSnapshotCommandResponse> {
    try {
      const { securityId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._SNAPSHOT_ROLE, account.id.toString(), securityId);

      const res = await handler.takeSnapshot(securityEvmAddress, securityId);

      const snapshotId = await this.transactionService.getTransactionResult({
        res,
        result: res.response?.snapshotId,
        className: TakeSnapshotCommandHandler.name,
        position: 0,
        numberOfResultsItems: 1,
      });

      return Promise.resolve(new TakeSnapshotCommandResponse(parseInt(snapshotId, 16), res.id!));
    } catch (error) {
      throw new TakeSnapshotCommandError(error as Error);
    }
  }
}
