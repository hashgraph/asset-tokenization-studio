import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IControlListStorageWrapper, IControlListStorageWrapperInterface } from "../../../../../contracts/layer_1/interfaces/controlList/IControlListStorageWrapper";
export declare class IControlListStorageWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "AccountIsBlocked";
        readonly type: "error";
    }];
    static createInterface(): IControlListStorageWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IControlListStorageWrapper;
}
