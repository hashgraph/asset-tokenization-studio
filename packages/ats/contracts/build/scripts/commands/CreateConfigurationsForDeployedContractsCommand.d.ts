import { DeployAtsContractsResult, BaseAtsContractListCommand, BaseBlockchainCommandParams } from '../index';
interface CreateConfigurationsForDeployedContractsCommandParams extends BaseBlockchainCommandParams {
    readonly deployedContractList: DeployAtsContractsResult;
}
export default class CreateConfigurationsForDeployedContractsCommand extends BaseAtsContractListCommand {
    private readonly equityUsaAddress;
    private readonly bondUsaAddress;
    private readonly excludeEquityAddresses;
    private readonly excludeBondAddresses;
    constructor({ deployedContractList, signer, overrides, }: CreateConfigurationsForDeployedContractsCommandParams);
    get commonFacetAddressList(): string[];
    get equityFacetAddressList(): string[];
    get bondFacetAddressList(): string[];
    private getFilteredFacetAddresses;
}
export {};
