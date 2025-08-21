import { BaseBlockchainQuery, BaseBlockchainQueryParams } from '../index';
interface GetFacetsByConfigurationIdAndVersionQueryParams extends BaseBlockchainQueryParams {
    businessLogicResolverAddress: string;
    configurationId: string;
}
export default class GetFacetsByConfigurationIdAndVersionQuery extends BaseBlockchainQuery {
    readonly businessLogicResolverAddress: string;
    readonly configurationId: string;
    constructor({ businessLogicResolverAddress, configurationId, provider, overrides, }: GetFacetsByConfigurationIdAndVersionQueryParams);
}
export {};
