import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IIdentityRegistry, IIdentityRegistryInterface } from "../../../../../contracts/layer_1/interfaces/ERC3643/IIdentityRegistry";
export declare class IIdentityRegistry__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }];
        readonly name: "isVerified";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IIdentityRegistryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IIdentityRegistry;
}
