import { Signer } from 'ethers'
import { Network } from '../../Configuration'

interface DeployAtsContractsCommandNewParams {
    signer: Signer
    useDeployed?: boolean
}

export interface DeployAtsContractsCommandParams
    extends DeployAtsContractsCommandNewParams {
    network: Network
}

export default class DeployAtsContractsCommand {
    public readonly useDeployed: boolean
    public readonly signer: Signer
    public readonly network: Network

    constructor({
        signer,
        network,
        useDeployed = true,
    }: DeployAtsContractsCommandParams) {
        this.useDeployed = useDeployed
        this.network = network!
        this.signer = signer
    }

    public static async newInstance({
        signer,
        useDeployed = true,
    }: DeployAtsContractsCommandNewParams): Promise<DeployAtsContractsCommand> {
        if (!signer.provider) {
            throw new Error('Signer must have a provider')
        }
        return new DeployAtsContractsCommand({
            signer,
            network: (await signer.provider.getNetwork()).name as Network,
            useDeployed,
        })
    }
}
