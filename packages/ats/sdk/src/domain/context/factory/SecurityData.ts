// SPDX-License-Identifier: Apache-2.0

import { ERC20MetadataInfo } from "./ERC20Metadata";
import { Rbac } from "./Rbac";
import { ResolverProxyConfiguration } from "./ResolverProxyConfiguration";

export class SecurityData {
  public arePartitionsProtected: boolean;
  public isMultiPartition: boolean;
  public resolver: string;
  public resolverProxyConfiguration: ResolverProxyConfiguration;
  public rbacs: Rbac[];
  public isControllable: boolean;
  public isWhiteList: boolean;
  public maxSupply: string;
  public erc20VotesActivated: boolean;
  public erc20MetadataInfo: ERC20MetadataInfo;
  public clearingActive: boolean;
  public internalKycActivated: boolean;
  public externalPauses: string[];
  public externalControlLists: string[];
  public externalKycLists: string[];
  public compliance: string;
  public identityRegistry: string;
}
