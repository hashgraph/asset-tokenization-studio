import { type ContractFactory, Overrides, Signer } from 'ethers';
import { DeployedContract } from '@configuration';
export default class DeployContractWithFactoryCommand<F extends ContractFactory> {
    readonly factory: F;
    readonly signer: Signer;
    readonly args: unknown[];
    readonly overrides?: Overrides;
    readonly withProxy: boolean;
    readonly deployedContract?: DeployedContract;
    constructor({ factory, signer, args, overrides, withProxy, deployedContract, }: {
        factory: F;
        signer: Signer;
        args?: unknown[];
        overrides?: Overrides;
        withProxy?: boolean;
        deployedContract?: DeployedContract;
    });
}
