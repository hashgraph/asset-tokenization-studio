import { LogError } from '@core/decorator/LogErrorDecorator';
import { GetSecurityDetailsRequest } from '../../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { SecurityViewModel } from '../../response';
import { GetSecurityQuery } from '@query/security/get/GetSecurityQuery';
import { BaseSecurityInPort } from '../BaseSecurityInPort';

export interface ISecurityInPortInfo {
  getInfo(request: GetSecurityDetailsRequest): Promise<SecurityViewModel>;
}

export class SecurityInPortInfo
  extends BaseSecurityInPort
  implements ISecurityInPortInfo
{
  @LogError
  async getInfo(
    request: GetSecurityDetailsRequest,
  ): Promise<SecurityViewModel> {
    const { securityId } = request;
    ValidatedRequest.handleValidation('GetSecurityDetailsRequest', request);
    const res = await this.queryBus.execute(new GetSecurityQuery(securityId));

    const security: SecurityViewModel = {
      name: res.security.name,
      symbol: res.security.symbol,
      isin: res.security.isin,
      type: res.security.type,
      decimals: res.security.decimals,
      isWhiteList: res.security.isWhiteList,
      isControllable: res.security.isControllable,
      isMultiPartition: res.security.isMultiPartition,
      totalSupply: res.security.totalSupply?.toString(),
      maxSupply: res.security.maxSupply?.toString(),
      diamondAddress: res.security.diamondAddress?.toString(),
      evmDiamondAddress: res.security.evmDiamondAddress?.toString(),
      paused: res.security.paused,
      regulation: res.security.regulation,
      isCountryControlListWhiteList: res.security.isCountryControlListWhiteList,
      countries: res.security.countries,
      info: res.security.info,
    };

    return security;
  }
}
