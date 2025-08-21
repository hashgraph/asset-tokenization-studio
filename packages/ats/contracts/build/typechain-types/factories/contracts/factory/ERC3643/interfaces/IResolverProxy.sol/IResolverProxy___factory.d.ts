import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IResolverProxy_, IResolverProxy_Interface } from "../../../../../../contracts/factory/ERC3643/interfaces/IResolverProxy.sol/IResolverProxy_";
export declare class IResolverProxy___factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "_functionSelector";
            readonly type: "bytes4";
        }];
        readonly name: "FunctionNotFound";
        readonly type: "error";
    }];
    static createInterface(): IResolverProxy_Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IResolverProxy_;
}
