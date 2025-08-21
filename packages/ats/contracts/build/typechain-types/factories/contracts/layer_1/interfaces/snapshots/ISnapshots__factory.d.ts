import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ISnapshots, ISnapshotsInterface } from "../../../../../contracts/layer_1/interfaces/snapshots/ISnapshots";
export declare class ISnapshots__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "snapshotId";
            readonly type: "uint256";
        }];
        readonly name: "SnapshotIdDoesNotExists";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SnapshotIdNull";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "snapshotID";
            readonly type: "uint256";
        }];
        readonly name: "SnapshotTaken";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "snapshotId";
            readonly type: "uint256";
        }];
        readonly name: "SnapshotTriggered";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_snapshotID";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }];
        readonly name: "balanceOfAtSnapshot";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "balance_";
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
            readonly internalType: "uint256";
            readonly name: "_snapshotID";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }];
        readonly name: "balanceOfAtSnapshotByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "balance_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_snapshotID";
            readonly type: "uint256";
        }];
        readonly name: "decimalsAtSnapshot";
        readonly outputs: readonly [{
            readonly internalType: "uint8";
            readonly name: "decimals_";
            readonly type: "uint8";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_snapshotID";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getTokenHoldersAtSnapshot";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "holders_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_snapshotID";
            readonly type: "uint256";
        }];
        readonly name: "getTotalTokenHoldersAtSnapshot";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_snapshotID";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }];
        readonly name: "lockedBalanceOfAtSnapshot";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "balance_";
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
            readonly internalType: "uint256";
            readonly name: "_snapshotID";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }];
        readonly name: "lockedBalanceOfAtSnapshotByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "balance_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_snapshotID";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }];
        readonly name: "partitionsOfAtSnapshot";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "";
            readonly type: "bytes32[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "takeSnapshot";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "snapshotID_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_snapshotID";
            readonly type: "uint256";
        }];
        readonly name: "totalSupplyAtSnapshot";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "totalSupply_";
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
            readonly internalType: "uint256";
            readonly name: "_snapshotID";
            readonly type: "uint256";
        }];
        readonly name: "totalSupplyAtSnapshotByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "totalSupply_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): ISnapshotsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ISnapshots;
}
