import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IIAFactory, IIAFactoryInterface } from "../../../../../../@tokenysolutions/t-rex/contracts/proxy/authority/IIAFactory";
export declare class IIAFactory__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_ia";
            readonly type: "address";
        }];
        readonly name: "ImplementationAuthorityDeployed";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }];
        readonly name: "deployIA";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_ia";
            readonly type: "address";
        }];
        readonly name: "deployedByFactory";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IIAFactoryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IIAFactory;
}
