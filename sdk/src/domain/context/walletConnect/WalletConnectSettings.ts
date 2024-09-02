export default class WalletConnectSettings {
  constructor(
    public projectId: string,
    public dappName: string,
    public dappDescription: string,
    public dappURL: string,
    public dappIcons: string[],
  ) {}
}
