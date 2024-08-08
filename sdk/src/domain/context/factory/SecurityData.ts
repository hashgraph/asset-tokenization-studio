import { ERC20MetadataInfo } from './ERC20Metadata.js';
import { Rbac } from './Rbac.js';

export class SecurityData {
  public isMultiPartition: boolean;
  public resolver: string;
  public businessLogicKeys: string[];
  public rbacs: Rbac[];
  public isControllable: boolean;
  public isWhiteList: boolean;
  public maxSupply: string;
  public erc20MetadataInfo: ERC20MetadataInfo;
}
