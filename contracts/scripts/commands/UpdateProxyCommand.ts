import { BaseBlockchainCommand, BaseBlockchainCommandParams } from '../index'

interface UpdateProxyCommandParams extends BaseBlockchainCommandParams {
    proxyAdminAddress: string
    transparentProxyAddress: string
    newImplementationAddress: string
}

export default class UpdateProxyCommand extends BaseBlockchainCommand {
    public readonly proxyAdminAddress: string
    public readonly transparentProxyAddress: string
    public readonly newImplementationAddress: string

    constructor({
        proxyAdminAddress,
        transparentProxyAddress,
        newImplementationAddress,
        signer,
        overrides,
    }: UpdateProxyCommandParams) {
        super({ signer, overrides })
        this.proxyAdminAddress = proxyAdminAddress
        this.transparentProxyAddress = transparentProxyAddress
        this.newImplementationAddress = newImplementationAddress
    }
}
