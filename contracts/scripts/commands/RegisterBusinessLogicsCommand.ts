import { Signer } from 'ethers'
import {
    BaseBusinessLogicResolverCommand,
    BaseBusinessLogicResolverCommandParams,
    DeployAtsContractsResult,
} from '../index'

interface RegisterBusinessLogicsCommandParams
    extends BaseBusinessLogicResolverCommandParams {}

export default class RegisterBusinessLogicsCommand extends BaseBusinessLogicResolverCommand {
    public readonly contractAddressListToRegister: string[]

    constructor({
        deployedContractList,
        signer,
    }: RegisterBusinessLogicsCommandParams) {
        super({ deployedContractList, signer })
        this.contractAddressListToRegister = [
            ...this.contractAddressList,
            this.equityUsaAddress,
            this.bondUsaAddress,
        ]
    }
}
