import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ITimeTravelStorageWrapper, ITimeTravelStorageWrapperInterface } from "../../../../../contracts/test/testTimeTravel/interfaces/ITimeTravelStorageWrapper";
export declare class ITimeTravelStorageWrapper__factory {
    static readonly abi: readonly [{
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
    static createInterface(): ITimeTravelStorageWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ITimeTravelStorageWrapper;
}
