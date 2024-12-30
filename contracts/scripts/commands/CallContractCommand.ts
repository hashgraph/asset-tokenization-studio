import { Contract, Overrides } from 'ethers'

export default class CallContractCommand {
    public readonly contract: Contract
    public readonly method: string
    public readonly args: Array<any>
    public readonly overrides?: Overrides

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
        this.contract = contract
        this.method = method
        this.args = args
        this.overrides = overrides
    }
}
