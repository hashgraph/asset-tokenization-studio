import { BaseBlockchainCommand, BaseBlockchainCommandParams } from '../../index'

export interface BaseAtsContractListCommandParams
    extends BaseBlockchainCommandParams {
    readonly contractAddressList: string[]
    readonly businessLogicResolverProxyAddress: string
}

export default abstract class BaseAtsContractListCommand extends BaseBlockchainCommand {
    public readonly contractAddressList: string[]
    public readonly businessLogicResolverProxyAddress: string

    constructor({
        contractAddressList,
        businessLogicResolverProxyAddress,
        signer,
        overrides,
    }: BaseAtsContractListCommandParams) {
        super({ signer, overrides })
        this.contractAddressList = contractAddressList
        this.businessLogicResolverProxyAddress =
            businessLogicResolverProxyAddress
    }
}
