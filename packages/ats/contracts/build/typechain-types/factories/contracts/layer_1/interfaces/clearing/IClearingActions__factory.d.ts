import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IClearingActions, IClearingActionsInterface } from "../../../../../contracts/layer_1/interfaces/clearing/IClearingActions";
export declare class IClearingActions__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }];
        readonly name: "ClearingActivated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }];
        readonly name: "ClearingDeactivated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "enum IClearing.ClearingOperationType";
            readonly name: "clearingOperationType";
            readonly type: "uint8";
        }];
        readonly name: "ClearingOperationApproved";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "enum IClearing.ClearingOperationType";
            readonly name: "clearingOperationType";
            readonly type: "uint8";
        }];
        readonly name: "ClearingOperationCanceled";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "enum IClearing.ClearingOperationType";
            readonly name: "clearingOperationType";
            readonly type: "uint8";
        }];
        readonly name: "ClearingOperationReclaimed";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "activateClearing";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "enum IClearing.ClearingOperationType";
                readonly name: "clearingOperationType";
                readonly type: "uint8";
            }, {
                readonly internalType: "bytes32";
                readonly name: "partition";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "tokenHolder";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "clearingId";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IClearing.ClearingOperationIdentifier";
            readonly name: "_clearingOperationIdentifier";
            readonly type: "tuple";
        }];
        readonly name: "approveClearingOperationByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "enum IClearing.ClearingOperationType";
                readonly name: "clearingOperationType";
                readonly type: "uint8";
            }, {
                readonly internalType: "bytes32";
                readonly name: "partition";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "tokenHolder";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "clearingId";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IClearing.ClearingOperationIdentifier";
            readonly name: "_clearingOperationIdentifier";
            readonly type: "tuple";
        }];
        readonly name: "cancelClearingOperationByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "deactivateClearing";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "_activateClearing";
            readonly type: "bool";
        }];
        readonly name: "initializeClearing";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "isClearingActivated";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "enum IClearing.ClearingOperationType";
                readonly name: "clearingOperationType";
                readonly type: "uint8";
            }, {
                readonly internalType: "bytes32";
                readonly name: "partition";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "tokenHolder";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "clearingId";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IClearing.ClearingOperationIdentifier";
            readonly name: "_clearingOperationIdentifier";
            readonly type: "tuple";
        }];
        readonly name: "reclaimClearingOperationByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IClearingActionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IClearingActions;
}
