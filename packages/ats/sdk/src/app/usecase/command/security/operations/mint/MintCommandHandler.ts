// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import SecurityService from "@service/security/SecurityService";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ValidationService from "@service/validation/ValidationService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ContractService from "@service/contract/ContractService";
import { KycStatus } from "@domain/context/kyc/Kyc";
import { MintCommand, MintCommandResponse } from "./MintCommand";
import { MintCommandError } from "./error/MintCommandError";

@CommandHandler(MintCommand)
export class MintCommandHandler implements ICommandHandler<MintCommand> {
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

  async execute(command: MintCommand): Promise<MintCommandResponse> {
    try {
      const { securityId, targetId, amount } = command;

      const handler = this.transactionService.getHandler();
      const security = await this.securityService.get(securityId);
      const account = this.accountService.getCurrentAccount();

      const amountBd = BigDecimal.fromString(amount, security.decimals);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      await this.validationService.checkDecimals(security, amount);

      await this.validationService.checkMaxSupply(securityId, amountBd, security);

      await this.validationService.checkControlList(securityId, targetId);

      await this.validationService.checkKycAddresses(securityId, [targetId], KycStatus.GRANTED);

      await this.validationService.checkMultiPartition(security);

      await this.validationService.checkIssuable(security);

      await this.validationService.checkAnyRole(
        [SecurityRole._ISSUER_ROLE, SecurityRole._AGENT_ROLE],
        account.id.toString(),
        securityId,
      );

      // Check that the amount to issue + total supply is not greater than max supply

      const res = await handler.mint(securityEvmAddress, targetEvmAddress, amountBd, securityId);
      return Promise.resolve(new MintCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new MintCommandError(error as Error);
    }
  }
}
