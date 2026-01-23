// SPDX-License-Identifier: Apache-2.0

import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { UpdateConfigVersionCommand, UpdateConfigVersionCommandResponse } from "./updateConfigVersionCommand";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { UpdateConfigVersionCommandError } from "./error/UpdateConfigVersionCommandError";

@CommandHandler(UpdateConfigVersionCommand)
export class UpdateConfigVersionCommandHandler implements ICommandHandler<UpdateConfigVersionCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: UpdateConfigVersionCommand): Promise<UpdateConfigVersionCommandResponse> {
    try {
      const { configVersion, securityId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await handler.updateConfigVersion(securityEvmAddress, configVersion, securityId);

      return Promise.resolve(new UpdateConfigVersionCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new UpdateConfigVersionCommandError(error as Error);
    }
  }
}
