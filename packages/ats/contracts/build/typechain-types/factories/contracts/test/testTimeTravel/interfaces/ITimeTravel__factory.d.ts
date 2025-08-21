import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ITimeTravel, ITimeTravelInterface } from "../../../../../contracts/test/testTimeTravel/interfaces/ITimeTravel";
export declare class ITimeTravel__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "blockTimestamp";
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
            readonly name: "_newSystemTime";
            readonly type: "uint256";
        }];
        readonly name: "changeSystemTimestamp";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "resetSystemTimestamp";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ITimeTravelInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ITimeTravel;
}
