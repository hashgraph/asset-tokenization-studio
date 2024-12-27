import { Signer } from 'ethers'
import { ContractName } from '../../Configuration'

export default class DeployContractCommand {
    private _name: ContractName
    private _signer: Signer
    private _args: Array<any>

    constructor({
        name,
        signer,
        args,
    }: {
        name: ContractName
        signer: Signer
        args: Array<any>
    }) {
        this._name = name
        this._signer = signer
        this._args = args
    }

    public get name(): ContractName {
        return this._name
    }
    public get signer(): Signer {
        return this._signer
    }
    public get args(): Array<any> {
        return this._args
    }
}
