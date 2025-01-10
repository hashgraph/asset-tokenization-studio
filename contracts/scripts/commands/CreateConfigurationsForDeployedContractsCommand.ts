import {
    DeployAtsContractsResult,
    BusinessLogicResolverProxyNotFound,
    BaseAtsContractListCommand,
    BaseBlockchainCommandParams,
} from '../index'

interface CreateConfigurationsForDeployedContractsCommandParams
    extends BaseBlockchainCommandParams {
    readonly deployedContractList: DeployAtsContractsResult
}

export default class CreateConfigurationsForDeployedContractsCommand extends BaseAtsContractListCommand {
    public readonly equityUsaAddress: string
    public readonly bondUsaAddress: string

    constructor({
        deployedContractList,
        signer,
        overrides,
    }: CreateConfigurationsForDeployedContractsCommandParams) {
        const {
            deployer: _,
            businessLogicResolver,
            equityUsa,
            bondUsa,
            ...contractListToRegister
        } = deployedContractList
        const contractAddressList = Object.values(contractListToRegister).map(
            (contract) => contract.address
        )

        if (!businessLogicResolver.proxyAddress) {
            throw new BusinessLogicResolverProxyNotFound()
        }

        super({
            contractAddressList,
            businessLogicResolverProxyAddress:
                businessLogicResolver.proxyAddress,
            signer,
            overrides,
        })
        this.equityUsaAddress = equityUsa.address
        this.bondUsaAddress = bondUsa.address
    }
    get commonFacetAddressList() {
        return this.contractAddressList
    }
}
