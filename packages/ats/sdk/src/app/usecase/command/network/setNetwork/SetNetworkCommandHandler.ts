// SPDX-License-Identifier: Apache-2.0

import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import Injectable from "@core/injectable/Injectable";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import NetworkService from "@service/network/NetworkService";
import { SetNetworkCommandError } from "./error/SetNetworkCommandError";
import { SetNetworkCommand, SetNetworkCommandResponse } from "./SetNetworkCommand";

@CommandHandler(SetNetworkCommand)
export class SetNetworkCommandHandler implements ICommandHandler<SetNetworkCommand> {
  constructor(
    @lazyInject(NetworkService)
    private readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(command: SetNetworkCommand): Promise<SetNetworkCommandResponse> {
    try {
      this.networkService.environment = command.environment;
      if (command.consensusNodes) this.networkService.consensusNodes = command.consensusNodes;
      if (command.rpcNode) this.networkService.rpcNode = command.rpcNode;

      // Init Mirror Node Adapter
      this.mirrorNodeAdapter.set(command.mirrorNode);
      this.networkService.mirrorNode = command.mirrorNode;

      // Init RPC Query Adapter
      Injectable.resolve(RPCQueryAdapter).init(this.networkService.rpcNode.baseUrl, this.networkService.rpcNode.apiKey);

      return Promise.resolve(
        new SetNetworkCommandResponse(
          this.networkService.environment,
          this.networkService.mirrorNode ?? "",
          this.networkService.rpcNode ?? "",
          this.networkService.consensusNodes ?? "",
        ),
      );
    } catch (error) {
      throw new SetNetworkCommandError(error as Error);
    }
  }
}
