import { Signer } from 'ethers'
import {
    DeployAtsContractsResult,
    BusinessLogicResolverProxyNotFound,
} from '../../index'

export interface BaseBusinessLogicResolverCommandParams {
    readonly deployedContractList: DeployAtsContractsResult
    readonly signer: Signer
}

export default abstract class BaseBusinessLogicResolverCommand {
    public readonly contractAddressList: string[]
    public readonly businessLogicResolverProxyAddress: string
    public readonly equityUsaAddress: string
    public readonly bondUsaAddress: string
    public readonly signer: Signer

    constructor({
        deployedContractList,
        signer,
    }: BaseBusinessLogicResolverCommandParams) {
        const {
            deployer: _,
            businessLogicResolver,
            equityUsa,
            bondUsa,
            ...contractListToRegister
        } = deployedContractList

        this.contractAddressList = Object.values(contractListToRegister).map(
            (contract) => contract.address
        )

        if (!businessLogicResolver.proxyAddress) {
            throw new BusinessLogicResolverProxyNotFound()
        }

        this.businessLogicResolverProxyAddress =
            businessLogicResolver.proxyAddress
        this.equityUsaAddress = equityUsa.address
        this.bondUsaAddress = bondUsa.address
        this.signer = signer
    }
}
