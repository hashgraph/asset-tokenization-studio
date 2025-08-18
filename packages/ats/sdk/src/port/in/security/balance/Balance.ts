import { LogError } from '@core/decorator/LogErrorDecorator';
import { GetAccountBalanceRequest } from '../../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { BalanceViewModel } from '../../response';
import { BalanceOfQuery } from '@query/security/balanceof/BalanceOfQuery';
import { BaseSecurityInPort } from '../BaseSecurityInPort';

export interface ISecurityInPortBalance {
  getBalanceOf(request: GetAccountBalanceRequest): Promise<BalanceViewModel>;
}

export class SecurityInPortBalance
  extends BaseSecurityInPort
  implements ISecurityInPortBalance
{
  @LogError
  async getBalanceOf(
    request: GetAccountBalanceRequest,
  ): Promise<BalanceViewModel> {
    ValidatedRequest.handleValidation('GetAccountBalanceRequest', request);

    const res = await this.queryBus.execute(
      new BalanceOfQuery(request.securityId, request.targetId),
    );

    const balance: BalanceViewModel = { value: res.payload.toString() };

    return balance;
  }
}
