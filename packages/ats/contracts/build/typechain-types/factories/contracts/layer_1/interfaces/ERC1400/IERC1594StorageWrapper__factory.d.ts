import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC1594StorageWrapper, IERC1594StorageWrapperInterface } from "../../../../../contracts/layer_1/interfaces/ERC1400/IERC1594StorageWrapper";
export declare class IERC1594StorageWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "IssuanceIsClosed";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "Issued";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_from";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "Redeemed";
        readonly type: "event";
    }];
    static createInterface(): IERC1594StorageWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC1594StorageWrapper;
}
