// SPDX-License-Identifier: Apache-2.0

import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { UpdateMaturityDateCommand, UpdateMaturityDateCommandResponse } from "./UpdateMaturityDateCommand";
import ContractService from "@service/contract/ContractService";
import ValidationService from "@service/validation/ValidationService";
import { UpdateMaturityDateCommandError } from "./error/UpdateMaturityDateCommandError";

@CommandHandler(UpdateMaturityDateCommand)
export class UpdateMaturityDateCommandHandler implements ICommandHandler<UpdateMaturityDateCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(ValidationService)
    private readonly validationService: ValidationService,
  ) {}

  async execute(command: UpdateMaturityDateCommand): Promise<UpdateMaturityDateCommandResponse> {
    try {
      const { maturityDate, securityId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      await this.validationService.checkMaturityDate(securityId, maturityDate);

      const res = await handler.updateMaturityDate(securityEvmAddress, parseInt(maturityDate), securityId);

      return Promise.resolve(new UpdateMaturityDateCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new UpdateMaturityDateCommandError(error as Error);
    }
  }
}
