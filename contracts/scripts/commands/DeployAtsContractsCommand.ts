import { Signer } from 'ethers'
import { Network } from '../../Configuration'
import { BaseCommand } from '../'

export default class DeployAtsContractsCommand extends BaseCommand {
    public readonly useDeployed: boolean

    constructor({
        signer,
        network,
        useDeployed = true,
    }: {
        signer: Signer
        network: Network
        useDeployed: boolean
    }) {
        super({ signer, network })
        this.useDeployed = useDeployed
    }
}
