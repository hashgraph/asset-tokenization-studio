import { BaseBlockchainQuery, BaseBlockchainQueryParams } from '../index';
interface ProxyImplementationQueryParams extends BaseBlockchainQueryParams {
    proxyAdminAddress: string;
    transparentProxyAddress: string;
}
export default class ProxyImplementationQuery extends BaseBlockchainQuery {
    readonly proxyAdminAddress: string;
    readonly transparentProxyAddress: string;
    constructor({ proxyAdminAddress, transparentProxyAddress, provider, overrides, }: ProxyImplementationQueryParams);
}
export {};
