import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC1410TokenHolder, IERC1410TokenHolderInterface } from "../../../../../contracts/layer_1/interfaces/ERC1400/IERC1410TokenHolder";
export declare class IERC1410TokenHolder__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_operator";
            readonly type: "address";
        }];
        readonly name: "authorizeOperator";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_operator";
            readonly type: "address";
        }];
        readonly name: "authorizeOperatorByPartition";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "redeemByPartition";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_operator";
            readonly type: "address";
        }];
        readonly name: "revokeOperator";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_operator";
            readonly type: "address";
        }];
        readonly name: "revokeOperatorByPartition";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "value";
                readonly type: "uint256";
            }];
            readonly internalType: "struct BasicTransferInfo";
            readonly name: "_basicTransferInfo";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "transferByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_from";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }];
        readonly name: "triggerAndSyncAll";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IERC1410TokenHolderInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC1410TokenHolder;
}
