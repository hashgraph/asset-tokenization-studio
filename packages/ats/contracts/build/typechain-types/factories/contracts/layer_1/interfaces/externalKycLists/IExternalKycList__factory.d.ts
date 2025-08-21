import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IExternalKycList, IExternalKycListInterface } from "../../../../../contracts/layer_1/interfaces/externalKycLists/IExternalKycList";
export declare class IExternalKycList__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "getKycStatus";
        readonly outputs: readonly [{
            readonly internalType: "enum IKyc.KycStatus";
            readonly name: "";
            readonly type: "uint8";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IExternalKycListInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IExternalKycList;
}
