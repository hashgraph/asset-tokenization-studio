import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPauseStorageWrapper, IPauseStorageWrapperInterface } from "../../../../../contracts/layer_1/interfaces/pause/IPauseStorageWrapper";
export declare class IPauseStorageWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "TokenIsPaused";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TokenIsUnpaused";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }];
        readonly name: "TokenPaused";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }];
        readonly name: "TokenUnpaused";
        readonly type: "event";
    }];
    static createInterface(): IPauseStorageWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPauseStorageWrapper;
}
