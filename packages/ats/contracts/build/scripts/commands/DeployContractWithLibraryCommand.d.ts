import { Signer } from 'ethers';
import { ContractName, LibraryName } from '@configuration';
interface DeployContractWithLibraryCommandParams {
    name: ContractName;
    signer: Signer;
    libraries: LibraryName[];
    args?: Array<unknown>;
}
export default class DeployContractWithLibraryCommand {
    readonly name: ContractName;
    readonly signer: Signer;
    readonly libraries: LibraryName[];
    readonly args: Array<unknown>;
    constructor({ name, signer, args, libraries, }: DeployContractWithLibraryCommandParams);
}
export {};
