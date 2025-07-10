import { LogError } from '@core/decorator/LogErrorDecorator';
import { GetNounceRequest } from '../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { GetNounceQuery } from '@query/security/protectedPartitions/getNounce/GetNounceQuery';
import { BaseSecurityInPort } from './BaseSecurityInPort';

export interface ISecurityInPortNounce {
  getNounce(request: GetNounceRequest): Promise<number>;
}

export class SecurityInPortNounce
  extends BaseSecurityInPort
  implements ISecurityInPortNounce
{
  @LogError
  async getNounce(request: GetNounceRequest): Promise<number> {
    ValidatedRequest.handleValidation('GetNounceRequest', request);

    return (
      await this.queryBus.execute(
        new GetNounceQuery(request.securityId, request.targetId),
      )
    ).payload;
  }
}
