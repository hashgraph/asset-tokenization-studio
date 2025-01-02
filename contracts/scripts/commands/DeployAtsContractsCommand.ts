import { Signer } from 'ethers'
import { Network } from '../../Configuration'

export default class DeployAtsContractsCommand {
    public readonly useDeployed: boolean
    public readonly signer: Signer
    public readonly network: Network

    constructor({
        signer,
        network,
        useDeployed = true,
    }: {
        signer: Signer
        network: Network
        useDeployed: boolean
    }) {
        this.useDeployed = useDeployed
        this.signer = signer
        this.network = network
    }
}
