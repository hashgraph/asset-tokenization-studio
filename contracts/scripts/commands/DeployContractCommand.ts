import { Signer } from 'ethers'
import { ContractName } from '../../Configuration'

export default class DeployContractCommand {
    public readonly name: ContractName
    public readonly signer: Signer
    public readonly args: Array<any>

    constructor({
        name,
        signer,
        args,
    }: {
        name: ContractName
        signer: Signer
        args: Array<any>
    }) {
        this.name = name
        this.signer = signer
        this.args = args
    }
}
