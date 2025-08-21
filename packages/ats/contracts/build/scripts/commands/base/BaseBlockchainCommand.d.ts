import { Overrides, Signer } from 'ethers';
export interface BaseBlockchainCommandParams {
    signer: Signer;
    overrides?: Overrides;
}
export default abstract class BaseBlockchainCommand {
    readonly signer: Signer;
    readonly overrides?: Overrides;
    constructor({ signer, overrides }: BaseBlockchainCommandParams);
}
