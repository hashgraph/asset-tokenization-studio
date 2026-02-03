// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import { IssueCommand, IssueCommandResponse } from "./IssueCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import { IssueCommandError } from "./error/IssueCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(IssueCommand)
export class IssueCommandHandler implements ICommandHandler<IssueCommand> {
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

  async execute(command: IssueCommand): Promise<IssueCommandResponse> {
    try {
      const { securityId, targetId, amount } = command;

      const handler = this.transactionService.getHandler();
      const security = await this.securityService.get(securityId);
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkMaxSupply(securityId, amountBd, security);

      await this.validationService.checkControlList(securityId, targetEvmAddress.toString());

      await this.validationService.checkKycAddresses(securityId, [targetId], KycStatus.GRANTED);

      await this.validationService.checkAnyRole(
        [SecurityRole._ISSUER_ROLE, SecurityRole._AGENT_ROLE],
        account.id.toString(),
        securityId,
      );

      await this.validationService.checkMultiPartition(security);

      await this.validationService.checkIssuable(security);

      // Check that the amount to issue + total supply is not greater than max supply

      const res = await handler.issue(securityEvmAddress, targetEvmAddress, amountBd, securityId);
      return Promise.resolve(new IssueCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new IssueCommandError(error as Error);
    }
  }
}
