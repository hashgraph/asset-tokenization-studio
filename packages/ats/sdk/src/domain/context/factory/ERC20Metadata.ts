// SPDX-License-Identifier: Apache-2.0

export class ERC20MetadataInfo {
  public name: string;
  public symbol: string;
  public decimals: number;
}

export class ERC20Metadata {
  public info: ERC20MetadataInfo;
  public securityType: number;
}
