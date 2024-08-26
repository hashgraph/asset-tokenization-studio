import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import Injectable from '../../../../../core/Injectable.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import NetworkService from '../../../../service/NetworkService.js';
import {
  SetNetworkCommand,
  SetNetworkCommandResponse,
} from './SetNetworkCommand.js';

@CommandHandler(SetNetworkCommand)
export class SetNetworkCommandHandler
  implements ICommandHandler<SetNetworkCommand>
{
  constructor(
    @lazyInject(NetworkService)
    public readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(
    command: SetNetworkCommand,
  ): Promise<SetNetworkCommandResponse> {
    console.log('SetNetworkCommandHandler', command);
    this.networkService.environment = command.environment;
    if (command.consensusNodes)
      this.networkService.consensusNodes = command.consensusNodes;
    if (command.rpcNode) this.networkService.rpcNode = command.rpcNode;

    // Init Mirror Node Adapter
    this.mirrorNodeAdapter.set(command.mirrorNode);
    this.networkService.mirrorNode = command.mirrorNode;

    // Init RPC Query Adapter
    Injectable.resolve(RPCQueryAdapter).init(
      this.networkService.rpcNode.baseUrl,
      this.networkService.rpcNode.apiKey,
    );

    return Promise.resolve(
      new SetNetworkCommandResponse(
        this.networkService.environment,
        this.networkService.mirrorNode ?? '',
        this.networkService.rpcNode ?? '',
        this.networkService.consensusNodes ?? '',
      ),
    );
  }
}
