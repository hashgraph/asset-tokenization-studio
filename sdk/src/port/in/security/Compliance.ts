import { LogError } from '@core/decorator/LogErrorDecorator';
import { ComplianceRequest, SetComplianceRequest } from '../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { SetComplianceCommand } from '@command/security/compliance/setCompliance/SetComplianceCommand';
import { ComplianceQuery } from '@query/security/compliance/compliance/ComplianceQuery';
import { BaseSecurityInPort } from './BaseSecurityInPort';

export interface ISecurityInPortCompliance {
  setCompliance(
    request: SetComplianceRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  compliance(request: ComplianceRequest): Promise<string>;
}

export class SecurityInPortCompliance
  extends BaseSecurityInPort
  implements ISecurityInPortCompliance
{
  @LogError
  async setCompliance(
    request: SetComplianceRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, compliance } = request;
    ValidatedRequest.handleValidation('SetComplianceRequest', request);

    return await this.commandBus.execute(
      new SetComplianceCommand(securityId, compliance),
    );
  }

  @LogError
  async compliance(request: ComplianceRequest): Promise<string> {
    const { securityId } = request;
    ValidatedRequest.handleValidation('ComplianceRequest', request);

    return (await this.queryBus.execute(new ComplianceQuery(securityId)))
      .payload;
  }
}
