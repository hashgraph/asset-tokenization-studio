import { BigNumber, Contract, Overrides } from 'ethers'

export default class CallContractCommand {
    private _contract: Contract
    private _method: string
    private _args: Array<any>
    private _overrides?: Overrides

    constructor({
        contract,
        method,
        args,
        overrides,
    }: {
        contract: Contract
        method: string
        args: Array<any>
        overrides?: Overrides
    }) {
        this._contract = contract
        this._method = method
        this._args = args
        this._overrides = overrides
    }

    get contract(): Contract {
        return this._contract
    }
    get method(): string {
        return this._method
    }

    get args(): Array<any> {
        return this._args
    }

    get overrides(): Overrides | undefined {
        return this._overrides
    }
}
