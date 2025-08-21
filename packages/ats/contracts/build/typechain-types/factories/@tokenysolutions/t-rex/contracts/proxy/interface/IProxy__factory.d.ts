import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IProxy, IProxyInterface } from "../../../../../../@tokenysolutions/t-rex/contracts/proxy/interface/IProxy";
export declare class IProxy__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_implementationAuthority";
            readonly type: "address";
        }];
        readonly name: "ImplementationAuthoritySet";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "getImplementationAuthority";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_newImplementationAuthority";
            readonly type: "address";
        }];
        readonly name: "setImplementationAuthority";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IProxyInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IProxy;
}
