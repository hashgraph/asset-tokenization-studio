import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICorporateActionsStorageWrapper, ICorporateActionsStorageWrapperInterface } from "../../../../../contracts/layer_1/interfaces/corporateActions/ICorporateActionsStorageWrapper";
export declare class ICorporateActionsStorageWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "firstDate";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "secondDate";
            readonly type: "uint256";
        }];
        readonly name: "WrongDates";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "index";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "actionType";
            readonly type: "bytes32";
        }];
        readonly name: "WrongIndexForAction";
        readonly type: "error";
    }];
    static createInterface(): ICorporateActionsStorageWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICorporateActionsStorageWrapper;
}
