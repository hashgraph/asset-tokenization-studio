import { Signer } from 'ethers'
import {
    BusinessLogicResolverProxyNotFound,
    DeployAtsContractsResult,
} from '../index'

interface RegisterBusinessLogicsCommandParams {
    deployedContractList: DeployAtsContractsResult
    signer: Signer
}

export default class RegisterBusinessLogicsCommand {
    public readonly contractAddressListToRegister: string[]
    public readonly businessLogicResolverProxy: string
    public readonly signer: Signer

    constructor({
        deployedContractList,
        signer,
    }: RegisterBusinessLogicsCommandParams) {
        const {
            factory: _,
            businessLogicResolver,
            ...contractListToRegister
        } = deployedContractList

        this.contractAddressListToRegister = Object.values(
            contractListToRegister
        ).map((contract) => contract.address)

        if (!businessLogicResolver.proxyAddress) {
            throw new BusinessLogicResolverProxyNotFound()
        }
        this.businessLogicResolverProxy = businessLogicResolver.proxyAddress

        this.signer = signer
    }
}
