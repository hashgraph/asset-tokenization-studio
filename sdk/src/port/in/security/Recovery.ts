import { LogError } from '@core/decorator/LogErrorDecorator';
import { IsAddressRecoveredRequest, RecoveryAddressRequest } from '../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { RecoveryAddressCommand } from '@command/security/operations/recoveryAddress/RecoveryAddressCommand';
import { IsAddressRecoveredQuery } from '@query/security/recovery/IsAddressRecoveredQuery';
import { BaseSecurityInPort } from './BaseSecurityInPort';

export interface ISecurityInPortRecovery {
  recoveryAddress(
    request: RecoveryAddressRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  isAddressRecovered(request: IsAddressRecoveredRequest): Promise<boolean>;
}

export class SecurityInPortRecovery
  extends BaseSecurityInPort
  implements ISecurityInPortRecovery
{
  @LogError
  async recoveryAddress(
    request: RecoveryAddressRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(RecoveryAddressRequest.name, request);
    return await this.commandBus.execute(
      new RecoveryAddressCommand(
        request.securityId,
        request.lostWalletId,
        request.newWalletId,
      ),
    );
  }

  @LogError
  async isAddressRecovered(
    request: IsAddressRecoveredRequest,
  ): Promise<boolean> {
    ValidatedRequest.handleValidation(IsAddressRecoveredRequest.name, request);
    return (
      await this.queryBus.execute(
        new IsAddressRecoveredQuery(request.securityId, request.targetId),
      )
    ).payload;
  }
}
