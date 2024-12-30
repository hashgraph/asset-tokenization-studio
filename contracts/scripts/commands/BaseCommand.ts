import { Signer } from 'ethers'
import { Network } from '../../Configuration'

export default abstract class BaseCommand {
    public readonly signer: Signer
    public readonly network: Network

    constructor({ signer, network }: { signer: Signer; network: Network }) {
        this.signer = signer
        this.network = network
    }
}
