// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import NetworkService from "@service/network/NetworkService";
import { SetConfigurationCommandError } from "./error/SetConfigurationCommandError";
import { SetConfigurationCommand, SetConfigurationCommandResponse } from "./SetConfigurationCommand";

@CommandHandler(SetConfigurationCommand)
export class SetConfigurationCommandHandler implements ICommandHandler<SetConfigurationCommand> {
  constructor(
    @lazyInject(NetworkService)
    private readonly networkService: NetworkService,
  ) {}

  async execute(command: SetConfigurationCommand): Promise<SetConfigurationCommandResponse> {
    try {
      this.networkService.configuration = {
        factoryAddress: command.factoryAddress,
        resolverAddress: command.resolverAddress,
      };
      return Promise.resolve(
        new SetConfigurationCommandResponse(
          this.networkService.configuration.factoryAddress,
          this.networkService.configuration.resolverAddress,
        ),
      );
    } catch (error) {
      throw new SetConfigurationCommandError(error as Error);
    }
  }
}
