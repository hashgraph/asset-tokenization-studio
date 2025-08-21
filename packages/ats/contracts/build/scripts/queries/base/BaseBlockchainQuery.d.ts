import { Overrides, providers } from 'ethers';
export interface BaseBlockchainQueryParams {
    provider: providers.Provider;
    overrides?: Overrides;
}
export default abstract class BaseBlockchainQuery {
    readonly provider: providers.Provider;
    readonly overrides?: Overrides;
    constructor({ provider, overrides }: BaseBlockchainQueryParams);
}
