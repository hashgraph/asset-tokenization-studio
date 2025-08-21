import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IClearingRead, IClearingReadInterface } from "../../../../../contracts/layer_1/interfaces/clearing/IClearingRead";
export declare class IClearingRead__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ClearingIsActivated";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ClearingIsDisabled";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ExpirationDateNotReached";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ExpirationDateReached";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "WrongClearingId";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }];
        readonly name: "getClearedAmountFor";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }];
        readonly name: "getClearedAmountForByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }, {
            readonly internalType: "enum IClearing.ClearingOperationType";
            readonly name: "_clearingOperationType";
            readonly type: "uint8";
        }];
        readonly name: "getClearingCountForByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "clearingCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }, {
            readonly internalType: "enum IClearing.ClearingOperationType";
            readonly name: "_clearingOperationType";
            readonly type: "uint8";
        }, {
            readonly internalType: "uint256";
            readonly name: "clearingId_";
            readonly type: "uint256";
        }];
        readonly name: "getClearingThirdParty";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "thirdParty_";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }, {
            readonly internalType: "enum IClearing.ClearingOperationType";
            readonly name: "_clearingOperationType";
            readonly type: "uint8";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getClearingsIdForByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256[]";
            readonly name: "clearingsId_";
            readonly type: "uint256[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IClearingReadInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IClearingRead;
}
