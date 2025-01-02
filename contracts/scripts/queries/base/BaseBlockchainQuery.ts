import { Overrides } from 'ethers'

export interface BaseBlockchainQueryParams {
    overrides?: Overrides
}

export default abstract class BaseBlockchainQuery {
    public readonly overrides?: Overrides

    constructor({ overrides }: BaseBlockchainQueryParams) {
        this.overrides = overrides
    }
}
