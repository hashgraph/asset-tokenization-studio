import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ISnapshotsStorageWrapper, ISnapshotsStorageWrapperInterface } from "../../../../../contracts/layer_1/interfaces/snapshots/ISnapshotsStorageWrapper";
export declare class ISnapshotsStorageWrapper__factory {
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
    }];
    static createInterface(): ISnapshotsStorageWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ISnapshotsStorageWrapper;
}
