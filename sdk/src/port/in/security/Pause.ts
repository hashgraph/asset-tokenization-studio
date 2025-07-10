import { LogError } from '@core/decorator/LogErrorDecorator';
import { PauseRequest } from '../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { PauseCommand } from '@command/security/operations/pause/PauseCommand';
import { UnpauseCommand } from '@command/security/operations/unpause/UnpauseCommand';
import { IsPausedQuery } from '@query/security/isPaused/IsPausedQuery';
import { BaseSecurityInPort } from './BaseSecurityInPort';

export interface ISecurityInPortPause {
  pause(
    request: PauseRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  unpause(
    request: PauseRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  isPaused(request: PauseRequest): Promise<boolean>;
}

export class SecurityInPortPause
  extends BaseSecurityInPort
  implements ISecurityInPortPause
{
  @LogError
  async pause(
    request: PauseRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation('PauseRequest', request);
    return this.commandBus.execute(new PauseCommand(request.securityId));
  }

  @LogError
  async unpause(
    request: PauseRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation('PauseRequest', request);
    return this.commandBus.execute(new UnpauseCommand(request.securityId));
  }

  @LogError
  async isPaused(request: PauseRequest): Promise<boolean> {
    ValidatedRequest.handleValidation('PauseRequest', request);
    return (await this.queryBus.execute(new IsPausedQuery(request.securityId)))
      .payload;
  }
}
