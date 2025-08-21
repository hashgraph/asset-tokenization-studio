import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { TimeTravelStorageWrapper, TimeTravelStorageWrapperInterface } from "../../../../../contracts/test/testTimeTravel/timeTravel/TimeTravelStorageWrapper";
export declare class TimeTravelStorageWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ExpirationNotReached";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "newSystemTime";
            readonly type: "uint256";
        }];
        readonly name: "InvalidTimestamp";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "WrongChainId";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "legacySystemTime";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "newSystemTime";
            readonly type: "uint256";
        }];
        readonly name: "SystemTimestampChanged";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [];
        readonly name: "SystemTimestampReset";
        readonly type: "event";
    }];
    static createInterface(): TimeTravelStorageWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): TimeTravelStorageWrapper;
}
