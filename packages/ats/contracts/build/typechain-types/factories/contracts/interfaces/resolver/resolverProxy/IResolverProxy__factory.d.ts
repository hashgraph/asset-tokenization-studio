import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IResolverProxy, IResolverProxyInterface } from "../../../../../contracts/interfaces/resolver/resolverProxy/IResolverProxy";
export declare class IResolverProxy__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "_functionSelector";
            readonly type: "bytes4";
        }];
        readonly name: "FunctionNotFound";
        readonly type: "error";
    }];
    static createInterface(): IResolverProxyInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IResolverProxy;
}
