import { Signer } from 'ethers'

export interface BaseAtsContractListCommandParams {
    readonly contractAddressList: string[]
    readonly businessLogicResolverProxyAddress: string
    readonly equityUsaAddress?: string
    readonly bondUsaAddress?: string
    readonly signer: Signer
}

export default abstract class BaseAtsContractListCommand {
    public readonly contractAddressList: string[]
    public readonly businessLogicResolverProxyAddress: string
    public readonly equityUsaAddress?: string
    public readonly bondUsaAddress?: string
    public readonly signer: Signer

    constructor({
        contractAddressList,
        businessLogicResolverProxyAddress,
        equityUsaAddress,
        bondUsaAddress,
        signer,
    }: BaseAtsContractListCommandParams) {
        this.contractAddressList = contractAddressList
        this.businessLogicResolverProxyAddress =
            businessLogicResolverProxyAddress
        this.equityUsaAddress = equityUsaAddress
        this.bondUsaAddress = bondUsaAddress
        this.signer = signer
    }
}
