import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ITransferAndLock, ITransferAndLockInterface } from "../../../../contracts/layer_3/interfaces/ITransferAndLock";
export declare class ITransferAndLock__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationTimestamp";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "lockId";
            readonly type: "uint256";
        }];
        readonly name: "PartitionTransferredAndLocked";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "from";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ITransferAndLock.TransferAndLockStruct";
            readonly name: "_transferAndLockData";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "_deadline";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_nounce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_signature";
            readonly type: "bytes";
        }];
        readonly name: "protectedTransferAndLock";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "lockId_";
            readonly type: "uint256";
        }];
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
                readonly name: "from";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ITransferAndLock.TransferAndLockStruct";
            readonly name: "_transferAndLockData";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "_deadline";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_nounce";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_signature";
            readonly type: "bytes";
        }];
        readonly name: "protectedTransferAndLockByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "lockId_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "_expirationTimestamp";
            readonly type: "uint256";
        }];
        readonly name: "transferAndLock";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "lockId_";
            readonly type: "uint256";
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
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "_expirationTimestamp";
            readonly type: "uint256";
        }];
        readonly name: "transferAndLockByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "lockId_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ITransferAndLockInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ITransferAndLock;
}
