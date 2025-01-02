import { Overrides, Signer } from 'ethers'

export interface BaseBlockchainCommandParams {
    signer: Signer
    overrides?: Overrides
}

export default abstract class BaseBlockchainCommand {
    public readonly signer: Signer
    public readonly overrides?: Overrides

    constructor({ signer, overrides }: BaseBlockchainCommandParams) {
        this.signer = signer
        this.overrides = overrides
    }
}
