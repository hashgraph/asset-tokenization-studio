export class ERC20MetadataInfo {
  public name: string;
  public symbol: string;
  public isin: string;
  public decimals: number;
}

export class ERC20Metadata {
  public info: ERC20MetadataInfo;
  public securityType: number;
}
