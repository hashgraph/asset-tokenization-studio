// SPDX-License-Identifier: Apache-2.0

import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import {
  SetRevocationRegistryAddressCommand,
  SetRevocationRegistryAddressCommandResponse,
} from "./SetRevocationRegistryAddressCommand";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import ValidationService from "@service/validation/ValidationService";
import ContractService from "@service/contract/ContractService";
import { SetRevocationRegistryAddressCommandError } from "./error/SetRevocationRegistryAddressCommandError";

@CommandHandler(SetRevocationRegistryAddressCommand)
export class SetRevocationRegistryAddressCommandHandler
  implements ICommandHandler<SetRevocationRegistryAddressCommand>
{
  constructor(
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: SetRevocationRegistryAddressCommand): Promise<SetRevocationRegistryAddressCommandResponse> {
    try {
      const { securityId, revocationRegistryId } = command;
      const handler = this.transactionService.getHandler();
      const account = this.accountService.getCurrentAccount();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      await this.validationService.checkPause(securityId);

      await this.validationService.checkRole(SecurityRole._SSI_MANAGER_ROLE, account.id.toString(), securityId);

      const revocationRegistryEvmAddress: EvmAddress =
        await this.contractService.getContractEvmAddress(revocationRegistryId);

      const res = await handler.setRevocationRegistryAddress(
        securityEvmAddress,
        revocationRegistryEvmAddress,
        securityId,
      );

      return Promise.resolve(new SetRevocationRegistryAddressCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new SetRevocationRegistryAddressCommandError(error as Error);
    }
  }
}
