// SPDX-License-Identifier: Apache-2.0

import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { ICommandHandler } from "@core/command/CommandHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { UpdateResolverCommand, UpdateResolverCommandResponse } from "./updateResolverCommand";
import ContractService from "@service/contract/ContractService";
import { UpdateResolverCommandError } from "./error/UpdateResolverCommandError";

@CommandHandler(UpdateResolverCommand)
export class UpdateResolverCommandHandler implements ICommandHandler<UpdateResolverCommand> {
  constructor(
    @lazyInject(TransactionService)
    private readonly transactionService: TransactionService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(command: UpdateResolverCommand): Promise<UpdateResolverCommandResponse> {
    try {
      const { configVersion, securityId, resolver, configId } = command;
      const handler = this.transactionService.getHandler();

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const resolverEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(resolver.toString());

      const res = await handler.updateResolver(
        securityEvmAddress,
        resolverEvmAddress,
        configVersion,
        configId,
        securityId,
      );

      return Promise.resolve(new UpdateResolverCommandResponse(res.error === undefined, res.id!));
    } catch (error) {
      throw new UpdateResolverCommandError(error as Error);
    }
  }
}
