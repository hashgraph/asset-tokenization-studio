// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import AccountService from "@service/account/AccountService";
import ValidationService from "@service/validation/ValidationService";
import { GrantKycCommand, GrantKycCommandResponse } from "./GrantKycCommand";
import TransactionService from "@service/transaction/TransactionService";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import { Terminal3Vc } from "@domain/context/kyc/Terminal3";
import { verifyVc } from "@terminal3/verify_vc";
import { SignedCredential } from "@terminal3/vc_core";
import { InvalidVc } from "@domain/context/security/error/operations/InvalidVc";
import ContractService from "@service/contract/ContractService";
import { GrantKycCommandError } from "./error/GrantKycCommandError";
import { KycStatus } from "@domain/context/kyc/Kyc";

@CommandHandler(GrantKycCommand)
export class GrantKycCommandHandler implements ICommandHandler<GrantKycCommand> {
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

  async execute(command: GrantKycCommand): Promise<GrantKycCommandResponse> {
    try {
      const { securityId, targetId, vcBase64 } = command;

      const signedCredential: SignedCredential = Terminal3Vc.vcFromBase64(vcBase64);
      const verificationResult = await verifyVc(signedCredential);
      if (!verificationResult.isValid) {
        throw new InvalidVc();
      }

      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const [issuer, updatedSignedCredential] = await this.validationService.checkValidVc(
        signedCredential,
        targetEvmAddress,
        securityId,
      );

      const issuerEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(issuer);

      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._KYC_ROLE, account.id.toString(), securityId);
      await this.validationService.checkKycAddresses(securityId, [targetId], KycStatus.NOT_GRANTED);

      const res = await handler.grantKyc(
        securityEvmAddress,
        targetEvmAddress,
        updatedSignedCredential.id,
        BigDecimal.fromString((updatedSignedCredential.validFrom as string).substring(0, 10)),
        BigDecimal.fromString((updatedSignedCredential.validUntil as string).substring(0, 10)),
        issuerEvmAddress,
      );

      return Promise.resolve(new GrantKycCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new GrantKycCommandError(error as Error);
    }
  }
}
