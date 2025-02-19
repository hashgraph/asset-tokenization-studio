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
    private readonly equityUsaAddress: string
    private readonly bondUsaAddress: string
    private readonly excludeEquityAddresses: string[] = []
    private readonly excludeBondAddresses: string[] = []

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

        if (!businessLogicResolver.proxyAddress) {
            throw new BusinessLogicResolverProxyNotFound()
        }

        const contractAddressList = Object.values(contractListToRegister).map(
            (contract) => contract.address
        )

        super({
            contractAddressList,
            businessLogicResolverProxyAddress:
                businessLogicResolver.proxyAddress,
            signer,
            overrides,
        })
        this.equityUsaAddress = equityUsa.address
        this.bondUsaAddress = bondUsa.address
        this.excludeBondAddresses = [
           deployedContractList.adjustBalances.address,
           deployedContractList.scheduledBalanceAdjustments.address,
        ]
    }
    get commonFacetAddressList() {
        return this.contractAddressList
    }

    get equityFacetAddressList(): string[] {
        return [
            ...this.getFilteredFacetAddresses(this.excludeEquityAddresses),
            this.equityUsaAddress,
        ]
    }

    get bondFacetAddressList(): string[] {
        return [
            ...this.getFilteredFacetAddresses(this.excludeBondAddresses),
            this.bondUsaAddress,
        ]
    }

    private getFilteredFacetAddresses(excludeList: string[]): string[] {
        return this.commonFacetAddressList.filter(
            (address) => !excludeList.includes(address)
        )
    }
}
