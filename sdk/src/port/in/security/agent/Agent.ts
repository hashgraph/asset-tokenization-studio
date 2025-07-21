import { LogError } from '@core/decorator/LogErrorDecorator';
import { AddAgentRequest, RemoveAgentRequest } from '../../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { RemoveAgentCommand } from '@command/security/operations/agent/removeAgent/RemoveAgentCommand';
import { AddAgentCommand } from '@command/security/operations/agent/addAgent/AddAgentCommand';
import { BaseSecurityInPort } from '../BaseSecurityInPort';

export interface ISecurityInPortAgent {
  addAgent(
    request: AddAgentRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  removeAgent(
    request: RemoveAgentRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
}

export class SecurityInPortAgent
  extends BaseSecurityInPort
  implements ISecurityInPortAgent
{
  @LogError
  async addAgent(
    request: AddAgentRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(AddAgentRequest.name, request);
    return await this.commandBus.execute(
      new AddAgentCommand(request.securityId, request.agentId),
    );
  }

  @LogError
  async removeAgent(
    request: RemoveAgentRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(RemoveAgentRequest.name, request);
    return await this.commandBus.execute(
      new RemoveAgentCommand(request.securityId, request.agentId),
    );
  }
}
