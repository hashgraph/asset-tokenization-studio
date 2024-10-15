import UpdateConfigRequest from './request/UpdateConfigRequest';
import { LogError } from '../../core/decorator/LogErrorDecorator';
import { handleValidation } from './Common';
import { UpdateConfigCommand } from '../../app/usecase/command/managment/updateConfig/updateConfigCommand';
import { QueryBus } from '../../core/query/QueryBus';
import Injectable from '../../core/Injectable';
import { CommandBus } from '../../core/command/CommandBus';

interface IManagementInPort {
  updateConfig(
    request: UpdateConfigRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
}

class ManagementInPort implements IManagementInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
  ) {}

  @LogError
  async updateConfig(
    request: UpdateConfigRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { configurationId, configVersion, securityId } = request;
    handleValidation('UpdateConfigRequest', request);

    return await this.commandBus.execute(
      new UpdateConfigCommand(configurationId, configVersion, securityId),
    );
  }
}
