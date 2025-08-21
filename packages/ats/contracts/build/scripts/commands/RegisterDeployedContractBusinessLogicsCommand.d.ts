import { DeployAtsContractsResult, BaseAtsContractListCommand, BaseBlockchainCommandParams } from '@scripts';
interface RegisterDeployedContractBusinessLogicsCommandParams extends BaseBlockchainCommandParams {
    readonly deployedContractList: DeployAtsContractsResult;
}
export default class RegisterDeployedContractBusinessLogicsCommand extends BaseAtsContractListCommand {
    constructor({ deployedContractList, signer, overrides, }: RegisterDeployedContractBusinessLogicsCommandParams);
    get deployedContractAddressList(): string[];
}
export {};
