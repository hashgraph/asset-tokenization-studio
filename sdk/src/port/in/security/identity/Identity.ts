import { LogError } from '@core/decorator/LogErrorDecorator';
import {
  IdentityRegistryRequest,
  OnchainIDRequest,
  SetIdentityRegistryRequest,
  SetOnchainIDRequest,
} from '../../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { SetOnchainIDCommand } from '@command/security/operations/tokenMetadata/setOnchainID/SetOnchainIDCommand';
import { SetIdentityRegistryCommand } from '@command/security/identityRegistry/setIdentityRegistry/SetIdentityRegistryCommand';
import { IdentityRegistryQuery } from '@query/security/identityRegistry/IdentityRegistryQuery';
import { OnchainIDQuery } from '@query/security/tokenMetadata/onchainId/OnchainIDQuery';
import { BaseSecurityInPort } from '../BaseSecurityInPort';

export interface ISecurityInPortIdentity {
  setOnchainID(
    request: SetOnchainIDRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  setIdentityRegistry(
    request: SetIdentityRegistryRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  identityRegistry(request: IdentityRegistryRequest): Promise<string>;
  onchainID(request: OnchainIDRequest): Promise<string>;
}

export class SecurityInPortIdentity
  extends BaseSecurityInPort
  implements ISecurityInPortIdentity
{
  @LogError
  async setOnchainID(
    request: SetOnchainIDRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, onchainID } = request;
    ValidatedRequest.handleValidation('SetOnchainIDRequest', request);

    return await this.commandBus.execute(
      new SetOnchainIDCommand(securityId, onchainID),
    );
  }

  @LogError
  async setIdentityRegistry(
    request: SetIdentityRegistryRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, identityRegistry } = request;
    ValidatedRequest.handleValidation('SetIdentityRegistryRequest', request);

    return await this.commandBus.execute(
      new SetIdentityRegistryCommand(securityId, identityRegistry),
    );
  }

  @LogError
  async identityRegistry(request: IdentityRegistryRequest): Promise<string> {
    const { securityId } = request;
    ValidatedRequest.handleValidation('IdentityRegistryRequest', request);

    return (await this.queryBus.execute(new IdentityRegistryQuery(securityId)))
      .payload;
  }

  @LogError
  async onchainID(request: OnchainIDRequest): Promise<string> {
    const { securityId } = request;
    ValidatedRequest.handleValidation('OnchainIDRequest', request);

    return (await this.queryBus.execute(new OnchainIDQuery(securityId)))
      .payload;
  }
}
