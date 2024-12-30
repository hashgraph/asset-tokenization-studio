import { ContractFactory, Overrides, Signer } from 'ethers'
import { DeployedContract } from '../../Configuration'

export default class DeployContractWithFactoryCommand<
    F extends ContractFactory
> {
    public readonly factory: F
    public readonly signer: Signer
    public readonly args: Array<any>
    public readonly overrides?: Overrides
    public readonly deployProxy: boolean
    public readonly deployedContract?: DeployedContract

    constructor({
        factory,
        signer,
        args = [],
        overrides,
        deployProxy = false,
        deployedContract,
    }: {
        factory: F
        signer: Signer
        args?: Array<any>
        overrides?: any
        deployProxy?: boolean
        deployedContract?: DeployedContract
    }) {
        this.factory = factory
        this.signer = signer
        this.args = args
        this.overrides = overrides
        this.deployProxy = deployProxy
        this.deployedContract = deployedContract
    }
}
