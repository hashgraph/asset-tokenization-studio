import { Signer } from 'ethers'

interface RegisterBusinessLogicsCommandParams {
    deployedContractAddressList: string[]
    businessLogicResolver: string
    signer: Signer
}

export default class RegisterBusinessLogicsCommand {
    // Don't forget to remove Factory and BusinessLogicResolver from the list of deployedContractAddressList
    public readonly deployedContractAddressList: string[]
    public readonly businessLogicResolver: string
    public readonly signer: Signer

    constructor({
        deployedContractAddressList,
        businessLogicResolver,
        signer,
    }: RegisterBusinessLogicsCommandParams) {
        this.deployedContractAddressList = deployedContractAddressList
        this.businessLogicResolver = businessLogicResolver
        this.signer = signer
    }
}
