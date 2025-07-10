import { LogError } from '@core/decorator/LogErrorDecorator';
import { GetMaxSupplyRequest, SetMaxSupplyRequest } from '../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { MaxSupplyViewModel } from '../response';
import { SetMaxSupplyCommand } from '@command/security/operations/cap/SetMaxSupplyCommand';
import { GetMaxSupplyQuery } from '@query/security/cap/getMaxSupply/GetMaxSupplyQuery';
import { BaseSecurityInPort } from './BaseSecurityInPort';

export interface ISecurityInPortSupply {
  setMaxSupply(
    request: SetMaxSupplyRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  getMaxSupply(request: GetMaxSupplyRequest): Promise<MaxSupplyViewModel>;
}

export class SecurityInPortSupply
  extends BaseSecurityInPort
  implements ISecurityInPortSupply
{
  @LogError
  async setMaxSupply(
    request: SetMaxSupplyRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, maxSupply } = request;
    ValidatedRequest.handleValidation('SetMaxSupplyRequest', request);

    return await this.commandBus.execute(
      new SetMaxSupplyCommand(maxSupply, securityId),
    );
  }

  @LogError
  async getMaxSupply(
    request: GetMaxSupplyRequest,
  ): Promise<MaxSupplyViewModel> {
    ValidatedRequest.handleValidation('GetMaxSupplyRequest', request);

    const res = await this.queryBus.execute(
      new GetMaxSupplyQuery(request.securityId),
    );

    const maxSupply: MaxSupplyViewModel = { value: res.payload.toString() };

    return maxSupply;
  }
}
