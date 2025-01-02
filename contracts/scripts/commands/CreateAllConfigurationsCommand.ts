import { Signer } from 'ethers'
import {
    BaseBusinessLogicResolverCommand,
    DeployAtsContractsResult,
} from '../index'

interface CreateAllConfigurationsCommandParams {
    readonly deployedContractList: DeployAtsContractsResult
    readonly signer: Signer
}

export default class CreateAllConfigurationsCommand extends BaseBusinessLogicResolverCommand {
    public readonly commonFacetAddressList: string[]
    public readonly businessLogicResolverProxy: string
    public readonly equityUsa: string
    public readonly bondUsa: string

    constructor({
        deployedContractList,
        signer,
    }: CreateAllConfigurationsCommandParams) {
        super(deployedContractList, signer)
        this.commonFacetAddressList = this.contractAddressList
        this.businessLogicResolverProxy = this.businessLogicResolverProxyAddress
        this.equityUsa = deployedContractList.equityUsa.address
        this.bondUsa = deployedContractList.bondUsa.address
    }
}
