import {
    DeployAtsContractsResult,
    BusinessLogicResolverProxyNotFound,
    BaseAtsContractListCommand,
    BaseBlockchainCommandParams,
} from '../index'

interface RegisterDeployedContractBusinessLogicsCommandParams
    extends BaseBlockchainCommandParams {
    readonly deployedContractList: DeployAtsContractsResult
}

export default class RegisterDeployedContractBusinessLogicsCommand extends BaseAtsContractListCommand {
    constructor({
        deployedContractList,
        signer,
        overrides,
    }: RegisterDeployedContractBusinessLogicsCommandParams) {
        const {
            deployer: _,
            businessLogicResolver,
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
    }
    get deployedContractAddressList() {
        return this.contractAddressList
    }
}
