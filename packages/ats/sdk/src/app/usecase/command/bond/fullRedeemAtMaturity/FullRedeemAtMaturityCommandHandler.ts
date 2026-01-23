// SPDX-License-Identifier: Apache-2.0

import { FullRedeemAtMaturityCommand, FullRedeemAtMaturityCommandResponse } from "./FullRedeemAtMaturityCommand";
import { FullRedeemAtMaturityCommandError } from "./error/FullRedeemAtMaturityCommandError";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import SecurityService from "@service/security/SecurityService";
import ValidationService from "@service/validation/ValidationService";

@CommandHandler(FullRedeemAtMaturityCommand)
export class FullRedeemAtMaturityCommandHandler implements ICommandHandler<FullRedeemAtMaturityCommand> {
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

  async execute(command: FullRedeemAtMaturityCommand): Promise<FullRedeemAtMaturityCommandResponse> {
    try {
      const { securityId, sourceId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const sourceEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(sourceId);

      const res = await handler.fullRedeemAtMaturity(securityEvmAddress, sourceEvmAddress, securityId);
      return Promise.resolve(new FullRedeemAtMaturityCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new FullRedeemAtMaturityCommandError(error as Error);
    }
  }
}
