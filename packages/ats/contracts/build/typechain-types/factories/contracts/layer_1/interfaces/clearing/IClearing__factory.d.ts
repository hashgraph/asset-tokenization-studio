import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IClearing, IClearingInterface } from "../../../../../contracts/layer_1/interfaces/clearing/IClearing";
export declare class IClearing__factory {
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
    }];
    static createInterface(): IClearingInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IClearing;
}
