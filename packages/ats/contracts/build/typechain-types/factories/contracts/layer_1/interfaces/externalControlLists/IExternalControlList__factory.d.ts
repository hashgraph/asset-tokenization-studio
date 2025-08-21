import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IExternalControlList, IExternalControlListInterface } from "../../../../../contracts/layer_1/interfaces/externalControlLists/IExternalControlList";
export declare class IExternalControlList__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "isAuthorized";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IExternalControlListInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IExternalControlList;
}
