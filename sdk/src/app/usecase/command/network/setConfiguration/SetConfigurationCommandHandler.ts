import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import NetworkService from '../../../../service/NetworkService.js';
import {
  SetConfigurationCommand,
  SetConfigurationCommandResponse,
} from './SetConfigurationCommand.js';

@CommandHandler(SetConfigurationCommand)
export class SetConfigurationCommandHandler
  implements ICommandHandler<SetConfigurationCommand>
{
  constructor(
    @lazyInject(NetworkService)
    public readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(
    command: SetConfigurationCommand,
  ): Promise<SetConfigurationCommandResponse> {
    this.networkService.configuration = {
      factoryAddress: command.factoryAddress,
      resolverAddress: command.resolverAddress,
      businessLogicKeysCommon: command.businessLogicKeysCommon,
      businessLogicKeysEquity: command.businessLogicKeysEquity,
      businessLogicKeysBond: command.businessLogicKeysBond,
    };
    return Promise.resolve(
      new SetConfigurationCommandResponse(
        this.networkService.configuration.factoryAddress,
        this.networkService.configuration.resolverAddress,
        this.networkService.configuration.businessLogicKeysCommon,
        this.networkService.configuration.businessLogicKeysEquity,
        this.networkService.configuration.businessLogicKeysBond,
      ),
    );
  }
}
