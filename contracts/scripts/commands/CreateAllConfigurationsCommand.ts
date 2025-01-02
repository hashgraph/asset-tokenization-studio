import { Signer } from 'ethers'
import {
    BusinessLogicResolverProxyNotFound,
    DeployAtsContractsResult,
} from '../index'

interface CreateAllConfigurationsCommandParams {
    readonly deployedContracts: DeployAtsContractsResult
    readonly signer: Signer
}

export default class CreateAllConfigurationsCommand {
    public readonly commonFacetAddressList: string[]
    public readonly businessLogicResolverProxy: string
    public readonly equityUsa: string
    public readonly bondUsa: string
    public readonly signer: Signer

    constructor({
        deployedContracts,
        signer,
    }: CreateAllConfigurationsCommandParams) {
        const {
            factory: _,
            businessLogicResolver,
            bondUsa,
            equityUsa,
            ...commonFacetList
        } = deployedContracts
        const commonFacetAddressList = Object.values(commonFacetList).map(
            (contract) => contract.address
        )
        if (!businessLogicResolver.proxyAddress) {
            throw new BusinessLogicResolverProxyNotFound()
        }
        this.commonFacetAddressList = commonFacetAddressList
        this.businessLogicResolverProxy = businessLogicResolver.proxyAddress
        this.equityUsa = equityUsa.address
        this.bondUsa = bondUsa.address
        this.signer = signer
    }
}
