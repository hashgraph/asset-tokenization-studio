import { Signer } from 'ethers'
import {
    BaseBusinessLogicResolverCommand,
    DeployAtsContractsResult,
} from '../index'

interface RegisterBusinessLogicsCommandParams {
    deployedContractList: DeployAtsContractsResult
    signer: Signer
}

export default class RegisterBusinessLogicsCommand extends BaseBusinessLogicResolverCommand {
    public readonly contractAddressListToRegister: string[]
    public readonly businessLogicResolverProxy: string

    constructor({
        deployedContractList,
        signer,
    }: RegisterBusinessLogicsCommandParams) {
        super(deployedContractList, signer)
        this.contractAddressListToRegister = this.contractAddressList
        this.businessLogicResolverProxy = this.businessLogicResolverProxyAddress
    }
}
