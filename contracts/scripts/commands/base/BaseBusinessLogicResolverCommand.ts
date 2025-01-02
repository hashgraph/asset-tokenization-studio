import { Signer } from 'ethers'
import {
    DeployAtsContractsResult,
    BusinessLogicResolverProxyNotFound,
} from '../../index'

export default abstract class BaseBusinessLogicResolverCommand {
    public readonly contractAddressList: string[]
    public readonly businessLogicResolverProxyAddress: string
    public readonly signer: Signer

    constructor(
        deployedContractList: DeployAtsContractsResult,
        signer: Signer
    ) {
        const {
            factory: _,
            businessLogicResolver,
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
        this.signer = signer
    }
}
