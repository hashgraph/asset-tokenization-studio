// SPDX-License-Identifier: Apache-2.0

import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { UpdateConfigCommand, UpdateConfigCommandResponse } from "./updateConfigCommand";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import TransactionService from "@service/transaction/TransactionService";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { UpdateConfigCommandError } from "./error/UpdateConfigCommandError";

@CommandHandler(UpdateConfigCommand)
export class UpdateConfigCommandHandler implements ICommandHandler<UpdateConfigCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: UpdateConfigCommand): Promise<UpdateConfigCommandResponse> {
    try {
      const { configId, configVersion, securityId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await handler.updateConfig(securityEvmAddress, configId, configVersion, securityId);

      return Promise.resolve(new UpdateConfigCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new UpdateConfigCommandError(error as Error);
    }
  }
}
