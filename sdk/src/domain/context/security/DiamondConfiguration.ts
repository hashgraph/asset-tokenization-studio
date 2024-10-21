export class DiamondConfiguration {
  constructor(
    public readonly resolverAddress: string,
    public readonly configId: string,
    public readonly configVersion: number,
  ) {}
}
