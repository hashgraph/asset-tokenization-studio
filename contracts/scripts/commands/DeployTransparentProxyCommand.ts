import { BaseBlockchainCommand, BaseBlockchainCommandParams } from '../index'

interface DeployUpgradeableProxyCommandParams
    extends BaseBlockchainCommandParams {
    proxyAdminAddress: string
    implementationAddress: string
}

export default class DeployUpgradeableProxyCommand extends BaseBlockchainCommand {
    public readonly proxyAdminAddress: string
    public readonly implementationAddress: string

    constructor({
        proxyAdminAddress,
        implementationAddress,
        signer,
        overrides,
    }: DeployUpgradeableProxyCommandParams) {
        super({ signer, overrides })
        this.proxyAdminAddress = proxyAdminAddress
        this.implementationAddress = implementationAddress
    }
}
