// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import UpdateConfigVersionRequest from "../request/management/UpdateConfigVersionRequest";
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { UpdateConfigVersionCommand } from "@command/management/updateConfigVersion/updateConfigVersionCommand";
import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import { GetConfigInfoRequest } from "../request";
import UpdateResolverRequest from "../request/management/UpdateResolverRequest";
import { UpdateResolverCommand } from "@command/management/updateResolver/updateResolverCommand";
import ContractId from "@domain/context/contract/ContractId";
import { GetConfigInfoQuery } from "@query/management/GetConfigInfoQuery";
import ConfigInfoViewModel from "../response/ConfigInfoViewModel";

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { UpdateConfigRequest } from "../request";
import { UpdateConfigCommand } from "@command/management/updateConfig/updateConfigCommand";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";

interface IManagementInPort {
  updateConfigVersion(request: UpdateConfigVersionRequest): Promise<{ payload: boolean; transactionId: string }>;
  updateConfig(request: UpdateConfigRequest): Promise<{ payload: boolean; transactionId: string }>;

  getConfigInfo(request: GetConfigInfoRequest): Promise<ConfigInfoViewModel>;
  updateResolver(request: UpdateResolverRequest): Promise<{ payload: boolean; transactionId: string }>;
}

class ManagementInPort implements IManagementInPort {
  constructor(
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNode: MirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter),
  ) {}

  @LogError
  async updateConfigVersion(request: UpdateConfigVersionRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { configVersion, securityId } = request;
    ValidatedRequest.handleValidation("UpdateConfigVersionRequest", request);

    return await this.commandBus.execute(new UpdateConfigVersionCommand(configVersion, securityId));
  }

  @LogError
  async updateConfig(request: UpdateConfigRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { configId, configVersion, securityId } = request;
    ValidatedRequest.handleValidation("UpdateConfigRequest", request);

    return await this.commandBus.execute(new UpdateConfigCommand(configId, configVersion, securityId));
  }

  @LogError
  async updateResolver(request: UpdateResolverRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { configId, securityId, resolver, configVersion } = request;
    ValidatedRequest.handleValidation("UpdateResolverRequest", request);

    return await this.commandBus.execute(
      new UpdateResolverCommand(configVersion, securityId, configId, new ContractId(resolver)),
    );
  }

  @LogError
  async getConfigInfo(request: GetConfigInfoRequest): Promise<ConfigInfoViewModel> {
    ValidatedRequest.handleValidation("GetConfigInfoRequest", request);

    const { payload } = await this.queryBus.execute(new GetConfigInfoQuery(request.securityId));
    const { resolverAddress, configId, configVersion } = payload;

    const resolverId = (await this.mirrorNode.getContractInfo(resolverAddress)).id;

    return {
      resolverAddress: resolverId,
      configId,
      configVersion,
    };
  }
}

const Management = new ManagementInPort();
export default Management;
