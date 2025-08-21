import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Version, VersionInterface } from "../../../../../@onchain-id/solidity/contracts/version/Version";
type VersionConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class Version__factory extends ContractFactory {
    constructor(...args: VersionConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<Version>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): Version;
    connect(signer: Signer): Version__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5060dd8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c806354fd4d5014602d575b600080fd5b6040805180820182526005815264322e322e3160d81b6020820152905160529190605b565b60405180910390f35b600060208083528351808285015260005b81811015608657858101830151858201604001528201606c565b506000604082860101526040601f19601f830116850101925050509291505056fea26469706673582212209f12647d36f50120ca41a7b3d2e9d57a943942cba3a6afc5162a32c4bf9236e064736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "version";
        readonly outputs: readonly [{
            readonly internalType: "string";
            readonly name: "";
            readonly type: "string";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }];
    static createInterface(): VersionInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): Version;
}
export {};
