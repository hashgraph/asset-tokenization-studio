import { Signer } from 'ethers';
import { ContractName } from '@configuration';
interface DeployContractCommandParams {
    name: ContractName;
    signer: Signer;
    args?: Array<unknown>;
}
export default class DeployContractCommand {
    readonly name: ContractName;
    readonly signer: Signer;
    readonly args: Array<unknown>;
    constructor({ name, signer, args }: DeployContractCommandParams);
}
export {};
