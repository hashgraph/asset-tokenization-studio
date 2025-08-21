import { Signer } from 'ethers';
import { Network } from '@configuration';
interface DeployAtsContractsCommandNewParams {
    signer: Signer;
    useDeployed?: boolean;
    useEnvironment?: boolean;
    timeTravelEnabled?: boolean;
    partialBatchDeploy?: boolean;
}
export interface DeployAtsContractsCommandParams extends DeployAtsContractsCommandNewParams {
    network: Network;
}
export default class DeployAtsContractsCommand {
    readonly useDeployed: boolean;
    readonly useEnvironment: boolean;
    readonly signer: Signer;
    readonly network: Network;
    readonly timeTravelEnabled: boolean;
    readonly partialBatchDeploy: boolean;
    constructor({ signer, network, useDeployed, useEnvironment, timeTravelEnabled, partialBatchDeploy, }: DeployAtsContractsCommandParams);
    static newInstance({ signer, useDeployed, useEnvironment, timeTravelEnabled, partialBatchDeploy, }: DeployAtsContractsCommandNewParams): Promise<DeployAtsContractsCommand>;
}
export {};
