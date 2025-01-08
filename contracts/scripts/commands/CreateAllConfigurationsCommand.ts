import {
    BaseBusinessLogicResolverCommand,
    BaseBusinessLogicResolverCommandParams,
} from '../index'

interface CreateAllConfigurationsCommandParams
    extends BaseBusinessLogicResolverCommandParams {}

export default class CreateAllConfigurationsCommand extends BaseBusinessLogicResolverCommand {
    public readonly commonFacetAddressList: string[]

    constructor({
        deployedContractList,
        signer,
    }: CreateAllConfigurationsCommandParams) {
        super({ deployedContractList, signer })
        this.commonFacetAddressList = this.contractAddressList
    }
}
