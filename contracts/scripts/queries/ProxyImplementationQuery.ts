import { BaseBlockchainQuery, BaseBlockchainQueryParams } from '../index'

interface ProxyImplementationQueryParams extends BaseBlockchainQueryParams {
    proxyAdminAddress: string
    transparentProxyAddress: string
}

export default class ProxyImplementationQuery extends BaseBlockchainQuery {
    public readonly proxyAdminAddress: string
    public readonly transparentProxyAddress: string

    constructor({
        proxyAdminAddress,
        transparentProxyAddress,
        provider,
        overrides,
    }: ProxyImplementationQueryParams) {
        super({ provider, overrides })
        this.proxyAdminAddress = proxyAdminAddress
        this.transparentProxyAddress = transparentProxyAddress
    }
}
