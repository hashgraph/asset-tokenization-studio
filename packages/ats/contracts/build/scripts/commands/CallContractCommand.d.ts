import { Contract, Overrides } from 'ethers';
export default class CallContractCommand {
    readonly contract: Contract;
    readonly method: string;
    readonly args: Array<unknown>;
    readonly overrides?: Overrides;
    constructor({ contract, method, args, overrides, }: {
        contract: Contract;
        method: string;
        args: Array<unknown>;
        overrides?: Overrides;
    });
}
